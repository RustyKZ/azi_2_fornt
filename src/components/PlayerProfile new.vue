<script>
import axios from 'axios';
import { serverUrl, serverMail } from '../main';
import { mapGetters, mapActions } from 'vuex';
import { email_check_auth } from '@/js/auth';
import { trunc_55 } from '../js/supply'
import { getTokenAmount, tokenTransfer, getSignature, getWalletAmount, tokenTransferUSDT, bnbTransfer } from '@/js/token'
import { get_ip_address } from '@/js/ip_address.js';

import { ref, onMounted, computed } from 'vue'
import { loadScript } from '@paypal/paypal-js'


export default {
  name: 'PlayerProfile',
  components: {
    
  },

  setup() {
    console.log('PAYPAL DONATION - setup...');
    const paypalButton = ref(null);
    const paypalDepositString = computed(() => this.depositValueSilverPaypal.toString());
    onMounted(() => {
      // Загрузка SDK PayPal
      loadScript({ 'client-id': 'ATVtjFAQiW84uJSCELJDy89J8MA-u6ldK_k9FlSqkXcuDad7DRfi3L9DBFxbL5O9RWyujt5VOnqWWZuh' }).then(() => {
        // Инициализация кнопки PayPal
        window.paypal.Buttons({
          createOrder: function(data, actions) {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: paypalDepositString.value,
                  currency_code: 'USD'
                }
              }]
            });
          },
          onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
              // Обработка успешного платежа
              console.log('Payment successful:', details);
            });
          },
          onError: function(err) {
            // Обработка ошибки платежа
            console.error('Payment error:', err);
          }
        }).render(paypalButton.value)
      })
    })      
    return { paypalButton }
  },


  computed: {
    ...mapGetters(['getCurrentLanguage', 'isAuth', 'isAuthWeb3', 'globalModalError', 'getUser']),
   
    referalUrl() {
      if (this.user['referal_code'] === '' || this.user['referal_code'] === undefined || this.user['referal_code'] === null) {
        return ''
      } else {
        const domain = window.location.href.split('/')[2];
        const protocol = window.location.protocol;
        return protocol + '//' + domain + '/signup/ref=' + this.user['referal_code'];
      }      
    },

    walletTokenAmountNumber() {
      return Number(this.walletTokenAmount);
    },

    paypalDepositString() {
      return this.depositValueSilverPaypal.toString();
    }
  },

  watch: {
    getCurrentLanguage(newLanguage) {
      this.update(newLanguage);
      this.fetchApiForm();      
    },

    getUser() { },

    '$route.params.user_id': {
      immediate: true, // Запустить наблюдение сразу после создания компонента
      handler() {
        this.getUserProfile();        
      },
    },
    
  },

  data() {
    return {
      formData: {},
      user: {},
      userId: 0,
      isEmailDefault: false,
      editingNickname: false,
      editingEmail: false,
      editingCountry: false,
      editingPhone: false,
      newNickname: '',
      newPhone: '',
      country: 0,          
      states: [],
      refLinkCopied: false,
      hoveredRefLink: false,
      verificationCode: '',      
      timeCount: '',
      timerRunning: false,
      timer: null,
      divDepositVisibleSilver: false,
      divDepositVisibleGold: false,
      divWithdrawVisible: false,
      buttonVisibleNickname: true,
      buttonVisibleEmail: true,
      buttonVisibleSilver: true,
      buttonVisibleGold: true,
      buttonVisibleDemo: true,
      buttonVisibleHistory: true,
      buttonVisibleCode: true,
      buttonVisibleReview: true,
      buttonVisiblePhone: true,
      buttonVisibleWithdraw: true,
      depositValueGold: 1,
      depositValueSilverPaypal: 1,
      depositValueSilverUSDT: 1,
      depositValueSilverBNB: 0.01,
      depositValueSilverCard: 1,
      withdrawValue: 100,
      walletTokenAmount: 0,
      withdrawMinLimit: 100,
      transferRate: 0.9,
      paymentMethod: 'paypal',      
      minDepositSilver: 1,
      minDepositSilverBNB: 0.01,
      maxDepositSilverBNB: 0.02,
      maxDepositSilverUSDT: 2,
      maxDepositSilver: 10000,
      userBNB: 0.01,
      userUSDT: 1,
      enoughBNB: true,
      enoughUSDT: true,
      rateUSD: 1000,
      rateBNB: 500000,
      paypalClientId: ''
    };
  },

  async created() {
    const userData = await email_check_auth();    
    if (!userData['is_auth']) {
      console.log('PLAYER PROFILE AccessDenied')
      this.goToAccessDenied(); // Переход на страницу доступа запрещен, если пользователь не авторизован
    }
    await this.fetchApiForm();
    this.getUserProfile();
  },

  mounted() {
    console.log('MOUNTED');

  },

  beforeUnmount() {
    clearInterval(this.timer);
  },

  methods: {
    ...mapActions(['setGlobalModalErrorOn', 'setGlobalModalErrorOff', 'setGlobalError', 'setGlobalErrorCustomText']),    

    startTimer() {
      if (!this.timerRunning) {
        this.timer = setInterval(() => {
          let secondsRemaining = null
          if (!this.user || !this.user.verification_time || this.user.verification_time === 0) {
            secondsRemaining = null;
          } else {
            const currentTime = Math.floor(Date.now() / 1000); // Текущее время в формате UNIX        
            secondsRemaining = this.user.verification_time - currentTime;
          }          
          if (secondsRemaining === null) {
            this.timeCount = '';
          } else if (secondsRemaining >= 0) {
            const time = new Date(secondsRemaining * 1000).toISOString().substr(11, 8);
            this.timeCount = time;
          } else {
            this.timeCount = '';
            this.getUserProfile();            
          }               
        }, 1000); // Обновление каждую секунду
        this.timerRunning = true;
      }
    },
    async stopTimer() {      
      clearInterval(this.timer);
      this.timerRunning = false;
      this.timer = null;
    },
    async fetchApiForm() {
      this.userId = this.$route.params.user_id;
      try {        
        const response = await axios.get(`${serverUrl}/api/get_user_profile_form`);        
        try {
          if (response.data[this.getCurrentLanguage-1]['label']) {
            this.formData = response.data[this.getCurrentLanguage-1]['form'];
            this.states = response.data[this.getCurrentLanguage-1]['states'];
          } 
        } catch {
          this.formData = response.data[0]['form'];
          this.states = response.data[0]['states'];
        }        
      } catch (error) {
        console.error('PLAYER PROFILE - fetchApiForm Error:', error);
      }
    },

    async getUserProfile() {
      this.userId = this.$route.params.user_id;
      try {
        const dataToSend = {
          'user_id': this.userId,
          'token': localStorage.getItem('authToken')
        }        
        const response = await axios.post(`${serverUrl}/api/get_user_profile_data`, dataToSend);
        this.user = response.data;        
        this.country = this.user.country;
        if (this.user.owner) {
          if (this.user.email.endsWith(serverMail)) {
            this.isEmailDefault = true;
          } else {            
            this.isEmailDefault = false;
          }
          if (this.user.verification_code && this.user.verification_code !== '' && this.user.verification_time > 0) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (currentTime < this.user.verification_time) {
              this.startTimer();
            }          
          } else {
            console.log('GET USER PORFILE - CLEAN INTERVAL')
            await this.stopTimer();
          }
        }        
      } catch (error) {
        console.error('PLAYER PROFILE - getUserProfile Error:', error);
      }
    },

    goToAccessDenied() {
      this.$router.push('/access_denied');
    },

    goToReviewPage() {
      this.$router.push(`/review/${this.userId}`);
    },

    goToHistoryPage() {
      this.$router.push(`/history/${this.userId}`);
    },

    async update(newLanguage) {
      await this.fetchApiForm(newLanguage);
    },

    getTruncEmail() {
        return trunc_55(this.user.email)
      },
    startEditingNickname() {
      this.newNickname = this.user.nickname;
      this.editingNickname = true;
    },
    cancelEditingNickname() {
      this.editingNickname = false;
    },
    async submitChangeNickname() {
      if (this.newNickname != this.user.nickname) {
        if (this.newNickname === '' || this.newNickname === null || this.newNickname === undefined) {
          this.setGlobalError(469);
          this.setGlobalModalErrorOn();          
        } else {
          try {
            const dataToSend = {
              'user_id': this.userId,
              'new_nickname': this.newNickname,
              'token': localStorage.getItem('authToken')
            }
            const response = await axios.post(`${serverUrl}/api/change_user_nickname`, dataToSend);
            console.log('CHANGE NICKNAME - response: ', response.data);
            if (response.data['result']) {
              await this.getUserProfile();
              this.$store.commit('setUser', {
                id: this.user.id,
                nickname: this.user.nickname,
                email: this.user.email,
                active_table: this.user.active_table,
                wallet: this.user.wallet
              });
              console.log('CHANGE NICKNAME - response: SUCCESS');
            } else {
              this.setGlobalError(response.data['code']);
              this.setGlobalModalErrorOn();
              console.log('CHANGE NICKNAME - response: ERROR');
            }          
          } catch (error) {
            this.setGlobalError(0);
            this.setGlobalModalErrorOn();
            console.error('Error fetching API data:', error);
          }
        }
      } else {
        console.log('CHANGE NICKNAME - canceled ');
      }
      this.editingNickname = false;
    },
    startEditingEmail() {
      this.newEmail = this.user.email;
      this.editingEmail = true;
    },
    cancelEditingEmail() {
      this.editingEmail = false;
    },

    async confirmEmail() {
      console.log('PLAYER PROFILE - Submit Email');
      try {
        const dataToSend = {
          'user_id': this.userId,            
          'token': localStorage.getItem('authToken')
        }
        this.setGlobalError(474);
        this.setGlobalModalErrorOn();
        const response = await axios.post(`${serverUrl}/api/user_confirm_email`, dataToSend);
        if (response.data['result']) {
        await this.getUserProfile();
        this.$store.commit('setUser', {
          id: this.user.id,
          nickname: this.user.nickname,
          email: this.user.email,
          active_table: this.user.active_table,
          wallet: this.user.wallet
        });
        this.setGlobalError(468);
        this.setGlobalModalErrorOn();
        } else {
          this.setGlobalError(response.data['code']);
          this.setGlobalModalErrorOn();
        }
      } catch (error) {
        this.setGlobalError(0);
        this.setGlobalModalErrorOn();
      }
      
    },

    startEditingCountry() {      
      this.editingCountry = true;
    },
    cancelEditingCountry() {
      this.editingCountry = false;
    },
    async submitChangeEmail() {
      if (this.newEmail != this.user.email) {
        if (this.newEmail === '' || this.newEmail === null || this.newEmail === undefined) {
          this.setGlobalError(469);
          this.setGlobalModalErrorOn();
        } else if (!(this.newEmail && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(this.newEmail))) {
          this.setGlobalError(470);
          this.setGlobalModalErrorOn();
        } else
        {
          try {
            const dataToSend = {
              'user_id': this.userId,
              'new_email': this.newEmail,
              'token': localStorage.getItem('authToken')
            }
            const response = await axios.post(`${serverUrl}/api/change_user_email`, dataToSend);
            console.log('CHANGE EMAIL - response: ', response.data);
            if (response.data['result']) {
              await this.getUserProfile();
              this.$store.commit('setUser', {
                id: this.user.id,
                nickname: this.user.nickname,
                django_name: this.user.django_name,
                active_table: this.user.active_table,
                wallet: this.user.wallet
              });
              console.log('CHANGE EMAIL - response: SUCCESS');
            } else {
              this.setGlobalError(response.data['code']);
              this.setGlobalModalErrorOn();
              console.log('CHANGE EMAIL - response: ERROR');
            }          
          } catch (error) {
            this.setGlobalError(0);
            this.setGlobalModalErrorOn();
            console.error('Error fetching API data:', error);
          }
        }
      } else {
        console.log('CHANGE NICKNAME - canceled ');
      }
      this.editingEmail = false;
    },
    startEditingPhone() {
      this.newPhone = this.user.phone;
      this.editingPhone = true;
    },
    cancelEditingPhone() {
      this.editingPhone = false;
    },

    confirmPhone() {
      this.setGlobalError(10);
      this.setGlobalModalErrorOn();
    },

    async submitChangePhone() {
      if (this.newPhone != this.user.phone) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_phone': this.newPhone,
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_phone`, dataToSend);
          console.log('CHANGE PHONE - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();            
            console.log('CHANGE PHONE - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE PHONE - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error change phone', error);
        }
      } else {
        console.log('CHANGE PHONE - canceled ');
      }
      this.editingPhone = false;
    },
    async stopChooseCountry() {      
      this.editingCountry = false;
      console.log('NEW COUNTRY IS ', this.newCountry );
      if (this.newCountry['id'] != this.user.country) {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'new_country': this.newCountry['id'],
            'token': localStorage.getItem('authToken')
          }
          const response = await axios.post(`${serverUrl}/api/change_user_country`, dataToSend);
          console.log('CHANGE COUNTRY - response: ', response.data);
          if (response.data['result']) {
            await this.getUserProfile();            
            console.log('CHANGE COUNTRY - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('CHANGE COUNTRY - response: ERROR');
          }          
        } catch (error) {
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error change country', error);
        }
      } else {
        console.log('CHANGE COUNTRY - canceled ');
      }      
    },

    textNumber(number) {
      if (typeof number !== 'number') {
        return '';
      }
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    async getReferalLink() {
      if ((this.user.referal_code === null || this.user.referal_code === '')) {
        try {
          const dataToSend = {
            'user_id': this.userId,            
            'token': localStorage.getItem('authToken')
          }
          console.log('getREF LINK ', dataToSend, ' USER CURRENT CODE IS ', this.user.referal_code);
          const response = await axios.post(`${serverUrl}/api/create_ref_code`, dataToSend);
          console.log(response)          
          if (response.data['result']) {
            await this.getUserProfile();            
            console.log('Creating ref code - response: SUCCESS');
          } else {
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('Creating ref code - response: ERROR');
          }          
        } catch (error) {
          console.error('Error creating ref code', error);
        }
      } else {
        this.setGlobalError(0);
        this.setGlobalModalErrorOn();
        console.log('GET REFERAL RINK ');
      }
    },

    copyToClipboard() {
      const url = this.referalUrl;
      navigator.clipboard.writeText(url).then(() => {
        console.log('Ссылка скопирована в буфер обмена:', url);
        this.refLinkCopied = true
        // Добавьте здесь обработку уведомления или других действий
      }).catch(err => {
        console.error('Ошибка копирования ссылки в буфер обмена:', err);
        // Добавьте здесь обработку ошибки, если необходимо
      });
    },

    async sendVerificationCode() {
      if ((this.verificationCode === null || this.verificationCode === '' || this.verificationCode === undefined)) {
        this.setGlobalError(469);
        this.setGlobalModalErrorOn();
      } else {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'code': this.verificationCode,
            'token': localStorage.getItem('authToken')
          }
          console.log('SEND VERIFICATION CODE - code is ', this.verificationCode);          
          const response = await axios.post(`${serverUrl}/api/user_confirm_code`, dataToSend);
          console.log(response)          
          if (response.data['result']) {
            await this.getUserProfile();
            this.setGlobalError(473);
            this.setGlobalModalErrorOn();
            console.log('SEND VERIFICATION CODE - response: SUCCESS');
          } else {
            await this.getUserProfile();
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('Creating ref code - response: ERROR');
          }          
        } catch (error) {
          await this.getUserProfile();
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error change phone', error);
        }
      }    
    },

    async depositDemocoin() {
      if ((this.user.democoin >= 1000)) {
        this.setGlobalError(475);
        this.setGlobalModalErrorOn();
      } else {
        try {
          const dataToSend = {
            'user_id': this.userId,
            'token': localStorage.getItem('authToken')
          }
          console.log('DEPOSIT DEMOCOIN');
          const response = await axios.post(`${serverUrl}/api/user_deposit_demo`, dataToSend);
          console.log(response)          
          if (response.data['result']) {
            await this.getUserProfile();
            this.setGlobalError(476);
            this.setGlobalModalErrorOn();
            console.log('DEPOSIT DEMOCOIN - response: SUCCESS');
          } else {
            await this.getUserProfile();
            this.setGlobalError(response.data['code']);
            this.setGlobalModalErrorOn();
            console.log('DEPOSIT DEMOCOIN - response: ERROR');
          }          
        } catch (error) {
          await this.getUserProfile();
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
          console.error('Error DEPOSIT DEMOCOIN', error);
        }
      }    
    },

    async openDepositGold() {
      console.log('PLAYER PROFILE - DEPOSIT GOLGCOIN')
      if (!this.isAuthWeb3) {
        this.setGlobalError(477);
        this.setGlobalModalErrorOn();
      } else {
        const getTokenQuantity = await getTokenAmount();
        console.log('OPEN DEPOSIT GOLD - ', getTokenQuantity);
        if (getTokenQuantity['status']) {
          this.walletTokenAmount = getTokenQuantity['balance'];
          this.divDepositVisibleGold = true;
          this.buttonVisibleNickname = false;
          this.buttonVisibleEmail = false;
          this.buttonVisibleSilver = false;
          this.buttonVisibleGold = false;
          this.buttonVisibleDemo = false;
          this.buttonVisibleHistory = false;
          this.buttonVisibleCode = false;
          this.buttonVisibleReview = false;
          this.buttonVisiblePhone = false;
          this.buttonVisibleWithdraw = false;
        } else {
          this.setGlobalError(getTokenQuantity['error']);
          this.setGlobalModalErrorOn();
        }
        
      }
    },

    closeDepositGold() {      
      this.divDepositVisibleGold = false;
      this.buttonVisibleNickname = true;
      this.buttonVisibleEmail = true;
      this.buttonVisibleSilver = true;
      this.buttonVisibleGold = true;
      this.buttonVisibleDemo = true;
      this.buttonVisibleHistory = true;
      this.buttonVisibleCode = true;
      this.buttonVisibleReview = true;
      this.buttonVisiblePhone = true;
      this.buttonVisibleWithdraw = true;
    },
    
    async depositGoldcoin() {
      const depositGold = Number(this.depositValueGold);
      console.log('DEPOSIT GOLDCOIN - ', depositGold);
      if (depositGold < 1 || depositGold > this.walletTokenAmount || !Number.isInteger(depositGold)) {
        this.setGlobalError(480);
        this.setGlobalModalErrorOn();
      } else {
        try {
          this.setGlobalError(481); // Сообщение о проведении транзакции
          this.setGlobalModalErrorOn();
          const transferResult = await tokenTransfer(depositGold);
          if (transferResult['status']) {            
            console.log('DEPOSIT GOLDCOIN - TOKEN TRANSFER result is True, Transaction data is ', transferResult['hash'], 'Transaction hash is ', transferResult['hash']['transactionHash'])
            try {
              const ip_address = await get_ip_address();
              const dataToSend = {
                'user_id': this.userId,
                'token': localStorage.getItem('authToken'),
                'transaction_hash': transferResult['hash']['transactionHash'],
                'gold_value': depositGold,
                'ip_address': ip_address
              }              
              const response = await axios.post(`${serverUrl}/api/user_deposit_gold`, dataToSend);
              const responseData = response['data']
              if (responseData['status']) {
                await this.getUserProfile();
                this.closeDepositGold();
                this.setGlobalError(482); // Сообщение об успешном завершении транзакции
                this.setGlobalModalErrorOn();
              } else {
                this.setGlobalError(responseData['error']); // Сообщение об ошибке
                this.setGlobalModalErrorOn();
              }              
            } catch(error) {
              console.error(error);
              this.closeDepositGold();
              this.setGlobalError(0);
              this.setGlobalModalErrorOn();
            }            
          } else {
            console.log('DEPOSIT GOLDCOIN - TOKEN TRANSFER result is False');
            this.closeDepositGold();
            this.setGlobalError(transferResult['error']);
            this.setGlobalModalErrorOn();  
          }
        } catch(error) {
          console.error(error);
          this.closeDepositGold();
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }
      }
    },    

    async openWithdrawGold() {
      if (this.user.goldcoin < 1) {
        this.setGlobalError(478);
        this.setGlobalModalErrorOn();
      } else if (!this.isAuthWeb3) {
        this.setGlobalError(479);
        this.setGlobalModalErrorOn();
      } else {
        try {                  
          const response = await axios.get(`${serverUrl}/api/get_payment_settings`);
          if (response.data['status']) {
            console.log('OPEN WITHDRAW GOLD', response.data.payment_settings)
            this.withdrawMinLimit = response.data.payment_settings['withdraw_min_limit'];
            this.withdrawValue = this.withdrawMinLimit;
            this.transferRate = response.data.payment_settings['gold_transfer_rate']/100;
            this.divWithdrawVisible = true;
            this.buttonVisibleNickname = false;
            this.buttonVisibleEmail = false;
            this.buttonVisibleSilver = false;
            this.buttonVisibleGold = false;
            this.buttonVisibleDemo = false;
            this.buttonVisibleHistory = false;
            this.buttonVisibleCode = false;
            this.buttonVisibleReview = false;
            this.buttonVisiblePhone = false;
            this.buttonVisibleWithdraw = false;
          }
        } catch(error) {
          console.error(error)
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();
        }                
      }
    },

    closeWithdrawGold() {
      this.divWithdrawVisible = false
      this.buttonVisibleNickname = true;
      this.buttonVisibleEmail = true;
      this.buttonVisibleSilver = true;
      this.buttonVisibleGold = true;
      this.buttonVisibleDemo = true;
      this.buttonVisibleHistory = true;
      this.buttonVisibleCode = true;
      this.buttonVisibleReview = true;
      this.buttonVisiblePhone = true;
      this.buttonVisibleWithdraw = true;
    },

    async withdrawGoldcoin() {
      const withdrawGold = Number(this.withdrawValue);
      console.log('WITHDRAW GOLDCOIN - ', withdrawGold);
      if (withdrawGold < this.withdrawMinLimit || withdrawGold > this.user.goldcoin || !Number.isInteger(withdrawGold)) {
        this.setGlobalError(480);
        this.setGlobalModalErrorOn();
      } else {
        this.setGlobalError(604);
        this.setGlobalModalErrorOn();
        const walletSignature = await getSignature();
        console.log('WITHDRAW GOLD COIN - signature: ', walletSignature);
        if (!walletSignature['signed']) {
          this.setGlobalError(walletSignature['error']);
          this.setGlobalModalErrorOn();
        } else {
          this.setGlobalModalErrorOff();
          const ip_address = await get_ip_address();
          const dataToSend = {
            'user_id': this.userId,
            'token': localStorage.getItem('authToken'),          
            'ip_address': ip_address,
            'signature': walletSignature['signature'],
            'user_address': walletSignature['userAddress'],
            'gold_value': withdrawGold,
          }
          try {
            const response = await axios.post(`${serverUrl}/api/user_withdraw_gold`, dataToSend);
            if (response.data['status']) {
              await this.getUserProfile();
              this.closeWithdrawGold();
              this.setGlobalError(607);
              this.setGlobalModalErrorOn();
              console.log('WITHDRAW GOLDCOIN - Response ', response);
            } else {
              console.log('WITHDRAW GOLDCOIN - Response Error: ');
              this.setGlobalError(response.data['error']);
              this.setGlobalModalErrorOn();  
            }
          } catch(error) {
            console.log('WITHDRAW GOLDCOIN - CATCH - Error: ', error);
            this.setGlobalError(0);
            this.setGlobalModalErrorOn();
          }
        }
      }
    },

    async openDepositSilver() {
      console.log('PLAYER PROFILE - DEPOSIT SILVERCOIN')
      if (!this.isAuth) {
        this.setGlobalError(477);
        this.setGlobalModalErrorOn();
      } else {
        try {
          const response = await axios.get(`${serverUrl}/api/get_payment_settings_silver`);
          console.log('OPEN DEPOSIT SILVER - GET PAYMENT SETTINGS SILVER response :', response);
          if (response.data['status']) {
            const paymentData = response.data.settings;
            this.paypalClientId = paymentData['paypal_client_id']
            this.rateBNB = paymentData['silver_bnb_rate']
            this.rateUSD = paymentData['silver_usd_rate']            
          } else {
            console.log('OPEN DEPOSIT SILVER - GET PAYMENT SETTINGS SILVER - Error: ');
            this.setGlobalError(response.data['error']);
            this.setGlobalModalErrorOn();    
          }
        } catch(error) {
          console.log('OPEN DEPOSIT SILVER - GET PAYMENT SETTINGS SILVER - CATCH - Error: ', error);
          this.setGlobalError(0);
          this.setGlobalModalErrorOn();  
        }

        const getTokenQuantity = await getWalletAmount();
        if (getTokenQuantity['status']) {
          this.userBNB = getTokenQuantity['balance_bnb'];
          this.userUSDT = getTokenQuantity['balance_usdt'];
          if (this.userBNB < this.minDepositSilverBNB) {
            this.enoughBNB = false;            
            this.depositValueSilverBNB = this.userBNB;
          }
          if (this.userUSDT < this.minDepositSilver) {
            this.enoughUSDT = false
            this.depositValueSilverUSDT = this.userUSDT;
          }
        }
        console.log('OPEN DEPOSIT SILVER - getToken', getTokenQuantity)
          this.divDepositVisibleSilver = true;
          this.buttonVisibleNickname = false;
          this.buttonVisibleEmail = false;
          this.buttonVisibleSilver = false;
          this.buttonVisibleGold = false;
          this.buttonVisibleDemo = false;
          this.buttonVisibleHistory = false;
          this.buttonVisibleCode = false;
          this.buttonVisibleReview = false;
          this.buttonVisiblePhone = false;
          this.buttonVisibleWithdraw = false;
                
      }
    },

    async testFunction() {
      try {
        const ip_address = await get_ip_address();
        const dataToSend = {
          'user_id': this.userId,
          'token': localStorage.getItem('authToken'),
          'payment_id': '0PH07554E7165302V',
          'payment_value': 100,
          'ip_address': ip_address
        }              
        const response = await axios.post(`${serverUrl}/api/user_deposit_silver_paypal`, dataToSend);
          console.log('testFUNCTION response - ', response);          
          const responseData = response['data']
          if (responseData['status']) {
            this.setGlobalError(487); // Сообщение об успешном завершении транзакции
            this.setGlobalModalErrorOn();
          } else {
            console.error('testFUNCTION esle ERROR', response)
            this.setGlobalError(responseData['error']); // Сообщение об ошибке
            this.setGlobalModalErrorOn();
          }              
      } catch(error) {
        console.error(error)
        this.setGlobalError(0);
        this.setGlobalModalErrorOn();
      }
    },

    async depositSilvercoin() {
      if (this.paymentMethod === 'paypal') {
        const depositSilverPaypal = Number(this.depositValueSilverPaypal);        
        if (depositSilverPaypal < this.minDepositSilver || depositSilverPaypal > this.maxDepositSilver || !Number.isInteger(depositSilverPaypal)) {
          this.setGlobalError(486);
          this.setGlobalModalErrorOn();        
        } else {
          console.log('DEPOSIT SILVERCOIN - paypal - value: ', depositSilverPaypal);
        }
      } else if (this.paymentMethod === 'bnb') {
        const depositSilverBNB = Number(this.depositValueSilverBNB);
        if (depositSilverBNB < this.minDepositSilverBNB || depositSilverBNB > this.maxDepositSilverBNB || isNaN(depositSilverBNB)) {
          this.setGlobalError(486);
          this.setGlobalModalErrorOn();        
        } else {
          console.log('DEPOSIT SILVERCOIN - BNB - value: ', depositSilverBNB);
          try {
            this.setGlobalError(481); // Сообщение о проведении транзакции
            this.setGlobalModalErrorOn();
            const transferResult = await bnbTransfer(depositSilverBNB);
            if (transferResult['status']) {            
              console.log('DEPOSIT SILVERCOIN - TOKEN TRANSFER result is True, Transaction data is ', transferResult['hash'], 'Transaction hash is ', transferResult['hash']['transactionHash'])
              try {
                const ip_address = await get_ip_address();
                const dataToSend = {
                  'user_id': this.userId,
                  'token': localStorage.getItem('authToken'),
                  'transaction_hash': transferResult['hash']['transactionHash'],
                  'bnb_value': depositSilverBNB,
                  'ip_address': ip_address
                }              
                const response = await axios.post(`${serverUrl}/api/user_deposit_silver_bnb`, dataToSend);
                const responseData = response['data']
                if (responseData['status']) {
                  await this.getUserProfile();
                  this.closeDepositSilver();
                  this.setGlobalError(487); // Сообщение об успешном завершении транзакции
                  this.setGlobalModalErrorOn();
                } else {
                  this.setGlobalError(responseData['error']); // Сообщение об ошибке
                  this.setGlobalModalErrorOn();
                }              
              } catch(error) {
                console.error(error);
                this.closeDepositSilver();
                this.setGlobalError(0);
                this.setGlobalModalErrorOn();
              }
            } else {
              console.log('DEPOSIT SILVERCOIN - TOKEN TRANSFER result is False');
              this.closeDepositSilver();
              this.setGlobalError(transferResult['error']);
              this.setGlobalModalErrorOn();  
            }
          } catch(error) {
            console.error(error);
            this.closeDepositSilver();
            this.setGlobalError(0);
            this.setGlobalModalErrorOn();
          }
        }
      } else if (this.paymentMethod === 'usdt') {
        const depositSilverUSDT = Number(this.depositValueSilverUSDT);
        if (depositSilverUSDT < this.minDepositSilver || depositSilverUSDT > this.maxDepositSilverUSDT || !Number.isInteger(depositSilverUSDT)) {
          this.setGlobalError(486);
          this.setGlobalModalErrorOn();        
        } else {
          console.log('DEPOSIT SILVERCOIN - USDT - value: ', depositSilverUSDT);
          try {
            this.setGlobalError(481); // Сообщение о проведении транзакции
            this.setGlobalModalErrorOn();
            const transferResult = await tokenTransferUSDT(depositSilverUSDT);
            if (transferResult['status']) {            
              console.log('DEPOSIT SILVERCOIN - TOKEN TRANSFER result is True, Transaction data is ', transferResult['hash'], 'Transaction hash is ', transferResult['hash']['transactionHash'])              
              try {
                const ip_address = await get_ip_address();
                const dataToSend = {
                  'user_id': this.userId,
                  'token': localStorage.getItem('authToken'),
                  'transaction_hash': transferResult['hash']['transactionHash'],
                  'usdt_value': depositSilverUSDT,
                  'ip_address': ip_address
                }              
                const response = await axios.post(`${serverUrl}/api/user_deposit_silver_usdt`, dataToSend);
                const responseData = response['data']
                if (responseData['status']) {
                  await this.getUserProfile();
                  this.closeDepositSilver();
                  this.setGlobalError(487); // Сообщение об успешном завершении транзакции
                  this.setGlobalModalErrorOn();
                } else {
                  this.setGlobalError(responseData['error']); // Сообщение об ошибке
                  this.setGlobalModalErrorOn();
                }              
              } catch(error) {
                console.error(error);
                this.closeDepositSilver();
                this.setGlobalError(0);
                this.setGlobalModalErrorOn();
              }
            } else {
              console.log('DEPOSIT SILVERCOIN (USDT) - TOKEN TRANSFER result is False');
              this.closeDepositSilver();
              this.setGlobalError(transferResult['error']);
              this.setGlobalModalErrorOn();  
            }
          } catch(error) {
            console.error(error);
            this.closeDepositSilver();
            this.setGlobalError(0);
            this.setGlobalModalErrorOn();
          }
        }

      } else if (this.paymentMethod === 'card') {
        const depositSilverCard = Number(this.depositValueSilverCard);
        if (depositSilverCard < this.minDepositSilver || depositSilverCard > this.maxDepositSilver || !Number.isInteger(depositSilverCard)) {
          this.setGlobalError(486);
          this.setGlobalModalErrorOn();        
        } else {
          console.log('DEPOSIT SILVERCOIN - card - value: ', depositSilverCard);
        }
      }
    },

    closeDepositSilver() {
      this.divDepositVisibleSilver = false;
      this.buttonVisibleNickname = true;
      this.buttonVisibleEmail = true;
      this.buttonVisibleSilver = true;
      this.buttonVisibleGold = true;
      this.buttonVisibleDemo = true;
      this.buttonVisibleHistory = true;
      this.buttonVisibleCode = true;
      this.buttonVisibleReview = true;
      this.buttonVisiblePhone = true;
      this.buttonVisibleWithdraw = true;
    },

  }
}

</script>

<template>
  <div class="content">    
    <div class="mainbox" style="cursor: default;">
      <div class="container my-3">        
        <div class="container mt-5; height: 100% ">
          
          <div v-if="refLinkCopied" class="alert alert-success" role="alert">
            {{ formData.alert_ref_link_copied }} 
          </div>
          <div class="alert alert-info" style="background: #F0FFF0; border: solid 1px green">
            <h3><b> {{ user.nickname }} </b> - {{ formData.title }}</h3> <button @click="testFunction">TEST function</button> {{paypalDepositString}}
            <hr>
            <!-- USER NICKNAME -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.username }}</h5>
              </div>
              <div v-if="!editingNickname" class="col-md-7 align-items-center d-flex">
                <h5 v-if="user.owner" style="cursor: pointer" @click="startEditingNickname"><b> {{ user.nickname }} </b></h5>
                <h5 v-if="!user.owner"><b> {{ user.nickname }} </b></h5>
                <br>
              </div>
              <div v-else class="col-md-7 align-items-center d-flex">
                <input v-model="newNickname" class="form-control" />
              </div>

              <div v-if="!editingNickname && buttonVisibleNickname" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button v-if="user.owner" @click="startEditingNickname" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_changeusername }}</button>
              </div>
              <div v-if="editingNickname && buttonVisibleNickname" class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button v-if="user.owner" @click="cancelEditingNickname" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button v-if="user.owner" @click="submitChangeNickname" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
            </div>
            <!-- USER EMAIL -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.email }}</h5>
              </div>
              <div v-if="!editingEmail" class="col-md-7 align-items-center d-flex">
                <h5 v-if="!user.email_is_verified  && (isEmailDefault || isAuthWeb3)" style="cursor: pointer" @click="startEditingEmail"><b> {{ getTruncEmail() }} </b></h5>
                <h5 v-else><b> {{ getTruncEmail() }} </b></h5>
                <br>
              </div>
              <div v-else class="col-md-7 align-items-center d-flex">
                <input v-model="newEmail" class="form-control" />
              </div>

              <div v-if="!user.email_is_verified && isEmailDefault && !editingEmail && buttonVisibleEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="startEditingEmail" class="btn btn-outline-secondary btn-sm w-100" :title="formData.hint_changeemail">{{ formData.button_changeemail }}</button>                
              </div>
              <div v-if="!user.email_is_verified && editingEmail && buttonVisibleEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button @click="cancelEditingEmail" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button @click="submitChangeEmail" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
              <div v-if="!user.email_is_verified && !isEmailDefault && isAuthWeb3 && !editingEmail && buttonVisibleEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center dropdown">
                <button class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" :title="formData.hint_email">{{ formData.button_confirmemail }} </button>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li><a class="dropdown-item" @click="confirmEmail" style="cursor: pointer">{{ formData.button_confirmemail }}</a></li>
                  <li><a class="dropdown-item" @click="startEditingEmail" style="cursor: pointer">{{ formData.button_changeemail }}</a></li>
                </ul>
              </div>
              <div v-if="!user.email_is_verified && !isEmailDefault && !isAuthWeb3 && !editingEmail && buttonVisibleEmail" @click="confirmEmail" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button class="btn btn-outline-secondary btn-sm w-100" :title="formData.hint_email">{{ formData.button_confirmemail }}</button>
              </div>                                              
              <div v-if="user.email_is_verified" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="badge_confirmed w-100" :title="formData.hint_email">🗹 {{ formData.button_confirmed }}</div>
              </div>
            </div>

            <div v-if="user.owner && user.verification_code && buttonVisibleEmail" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3" :title="formData.hint_verification_code">
                <h5 class="me-3">{{ formData.verification_code }}</h5>
              </div>
              <div class="col-md-2 align-items-center d-flex">
                <input v-model="verificationCode" class="form-control" :title="formData.hint_verification_code"/>
              </div>
              <div class="col-md-5 align-items-center d-flex">
                {{ formData.try_remaining }} {{user.verification_try}} | {{formData.time_remaining}} {{this.timeCount}}
              </div>
              <div class="col-md-2 align-items-center d-flex">
                <button @click="sendVerificationCode" class="btn btn-outline-success btn-sm w-100">{{ formData.button_confirm_code }}</button>
              </div>
            </div>
            <!-- USER SILVERCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.silvercoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_silvercoin"><b> {{ textNumber(user.silvercoin) }} </b></h5><br>
              </div>
              <div v-if="buttonVisibleSilver" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div v-if="!divDepositVisibleSilver" @click="openDepositSilver" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_addsilvercoin }}</div>
              </div>
            </div>
            <!-- Deposit block -->
            <div v-if="user.owner && divDepositVisibleSilver" class="row align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <div class="text-justify">
                  <p>
                    {{ formData.text_deposit_silver }}
                  </p>
                  <div>
                    <a :href="formData.link_more_info_support" target="_blank">{{ formData.more_info_silver}}</a>
                  </div>
                </div>
              </div>
              <div class="col-md-4 align-items-center d-flex">
                <div class="container">
                  <h6>{{ formData.select_payment_method }}</h6>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentRadios" v-model="paymentMethod" id="paypal" value="paypal" checked>
                    <label class="form-check-label" for="paypal">
                      {{ formData.pm_paypal }}
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentRadios" v-model="paymentMethod" id="bnb" value="bnb" :disabled="!isAuthWeb3">
                    <label class="form-check-label" for="bnb">
                      {{ formData.pm_bnb }}
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="paymentRadios" v-model="paymentMethod" id="usdt" value="usdt" :disabled="!isAuthWeb3">
                    <label class="form-check-label" for="usdt">
                      {{ formData.pm_usdt }}
                    </label>
                  </div>                  
                  <div class="form-check" :title=formData.hint_no_support_function>
                    <input class="form-check-input" type="radio" name="paymentRadios" v-model="paymentMethod" id="card" value="card" disabled>
                    <label class="form-check-label" for="card">
                      {{ formData.pm_card }}
                    </label>
                  </div>

                </div>
              </div>
            </div>
            <div v-if="user.owner && divDepositVisibleSilver" class="row mt-3 align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-5 d-flex">
                <div class="align-items-center">
                  <span>{{ formData.text_will_get_silver }}</span>                  
                  <b v-if="paymentMethod === 'paypal'">{{textNumber(Number(depositValueSilverPaypal) * rateUSD)}}</b>
                  <b v-if="paymentMethod === 'bnb'">{{textNumber(Number(depositValueSilverBNB) * rateBNB)}}</b>
                  <b v-if="paymentMethod === 'usdt'">{{textNumber(Number(depositValueSilverUSDT) * rateUSD)}}</b>
                  <b v-if="paymentMethod === 'card'">{{textNumber(Number(depositValueSilverCard) * rateUSD)}}</b>                  
                </div>
              </div>
                <div class="col-md-4">
                <div class="input-group mb-3">
                  <span v-if="paymentMethod === 'paypal' || paymentMethod === 'card'" class="input-group-text">{{ formData.put_money }} {{ formData.money_usd }}</span>
                  <span v-if="paymentMethod === 'bnb'" class="input-group-text">{{ formData.put_money }} {{ formData.money_bnb }}</span>
                  <span v-if="paymentMethod === 'usdt'" class="input-group-text">{{ formData.put_money }} {{ formData.money_usdt }}</span>                  
                  <input v-if="paymentMethod === 'paypal'" type="number" class="form-control" v-model="depositValueSilverPaypal">
                  <input v-if="paymentMethod === 'bnb'" type="number" class="form-control" v-model="depositValueSilverBNB" :disabled="userBNB < minDepositSilverBNB">
                  <input v-if="paymentMethod === 'usdt'" type="number" class="form-control" v-model="depositValueSilverUSDT" :disabled="userUSDT < minDepositSilver">
                  <input v-if="paymentMethod === 'card'" type="number" class="form-control" v-model="depositValueSilverCard">
                </div>
                <input v-if="paymentMethod === 'paypal'" type="range" class="form-range" :min=minDepositSilver :max=maxDepositSilver id="customRangePaypal" v-model="depositValueSilverPaypal">
                <input v-if="paymentMethod === 'bnb'" type="range" class="form-range" :min=minDepositSilverBNB :max=userBNB step="0.01" id="customRangeBNB" v-model="depositValueSilverBNB" :disabled="userBNB < minDepositSilverBNB">
                <input v-if="paymentMethod === 'usdt'" type="range" class="form-range" :min=minDepositSilver :max=userUSDT id="customRangeUSTD" step="0.5" v-model="depositValueSilverUSDT" :disabled="userUSDT < minDepositSilver">
                <input v-if="paymentMethod === 'card'" type="range" class="form-range" :min=minDepositSilver :max=maxDepositSilver id="customRangeCard" v-model="depositValueSilverCard">
              </div>
              
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="closeDepositSilver" class="btn btn-outline-danger btn-sm w-100 mb-1">{{ formData.button_cancel }}</div>                
                <button @click="depositSilvercoin" v-if="paymentMethod !== 'paypal'" class="btn btn-success btn-sm w-100"  :disabled="(!enoughBNB && paymentMethod === 'bnb') || (!enoughUSDT && paymentMethod === 'usdt')">{{ formData.button_donate }}</button>
              </div>
            </div>

            <div v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'" class="row mt-3 align-items-center d-flex">
              <div v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'" class="col-md-1 align-items-center d-flex">
              </div>
              <div v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'" class="col-md-8 d-flex">
                <p v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
              </div>
              <div v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'" class="col-md-3 align-items-end">                
                  <div v-show="user.owner && divDepositVisibleSilver && paymentMethod === 'paypal'" ref="paypalButton"></div>                
              </div>
            </div>

            <!-- USER GOLDCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.goldcoin }}</h5>
              </div>
              <div class="col-md-5 align-items-center d-flex">
                <h5 :title="formData.hint_goldcoin"><b> {{ textNumber(user.goldcoin) }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button v-if="!divDepositVisibleGold && buttonVisibleWithdraw" @click="openWithdrawGold" :title="formData.hint_withdraw" class="btn btn-outline-success btn-sm w-100">{{ formData.button_withdraw }}</button>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button v-if="!divDepositVisibleGold && buttonVisibleGold" @click="openDepositGold" class="btn btn-warning btn-sm w-100">{{ formData.button_addgoldcoin }}</button>
              </div>
            </div>
            <!-- Deposit block -->
            <div v-if="user.owner && divDepositVisibleGold" class="row align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-9 align-items-center d-flex">
                <div class="text-justify">
                  <p>
                    {{ formData.text_deposit_gold }}
                  </p>
                  <div>
                    <a :href="formData.link_more_info_token" target="_blank">{{ formData.text_more_info_token}}</a>
                  </div>
                </div>
              </div>
              <div class="col-md-2 align-items-center d-flex">
              </div>
            </div>
            <!-- Deposit block - tokens are in the wallet: true -->
            <div v-if="user.owner && divDepositVisibleGold && walletTokenAmountNumber >= 1" class="row mt-3 align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-5 d-flex">
                <div class="align-items-center d-flex">
                  
                  <h5>{{ formData.token_amount}}<b>{{ textNumber(walletTokenAmount) }}</b></h5>
                  
                </div>
              </div>
              <div class="col-md-4">
                <div class="input-group mb-3">
                  <span class="input-group-text">{{ formData.get_goldcoins }}</span>                                        
                  <input type="number" class="form-control" v-model="depositValueGold">
                </div>
                <input type="range" class="form-range" min="1" :max=walletTokenAmount id="customRange2" v-model="depositValueGold">                
              </div>
              
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="closeDepositGold" class="btn btn-outline-danger btn-sm w-100 mb-1">{{ formData.button_cancel }}</div>
                <button @click="depositGoldcoin" class="btn btn-success btn-sm w-100">{{ formData.button_addgoldcoin }}</button>
              </div>
            </div>
            <!-- Deposit block - tokens are in the wallet: false -->
            <div v-if="user.owner && divDepositVisibleGold && walletTokenAmountNumber < 1" class="row align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-9 align-items-center d-flex flex-wrap">
                <div class="text-jusitify">
                  <p>
                    {{ formData.text_no_token }}
                  </p>                
                </div>                
              </div>              
              
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="closeDepositGold" class="btn btn-outline-secondary btn-sm w-100 mb-1">{{ formData.button_clear }}</div>                
              </div>
            </div>

            <!-- Withdraw block -->
            <div v-if="user.owner && divWithdrawVisible" class="row align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-9 align-items-center d-flex">
                <div class="text-justify">
                  <p>
                    {{ formData.text_withdraw }}
                    <br>
                    {{ formData.text_rate }}<b> 100 : {{ transferRate*100}} </b>
                  </p>
                  <div>
                    <a :href="formData.link_more_info_token" target="_blank">{{ formData.text_more_info_token}}</a>
                  </div>
                </div>
              </div>
              <div class="col-md-2 align-items-center d-flex">
              </div>
            </div>

            <!-- Withdraw block - Goldcoins are on the account - true -->
            <div v-if="user.owner && divWithdrawVisible && user.goldcoin >= withdrawMinLimit" class="row mt-3 align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-5 d-flex">
                <div class="container align-items-center">
                  <h5>{{ formData.withdraw_token_promise}}<b>{{ textNumber( parseFloat((withdrawValue * transferRate).toFixed(2)) ) }}</b></h5>                  
                  {{ formData.text_withdraw_min_limit }} <b>{{ withdrawMinLimit }}</b>
                </div>                
              </div>
              <div class="col-md-4">
                <div class="input-group mb-3">
                  <span class="input-group-text">{{ formData.withdraw_gold }}</span>                                        
                  <input type="number" class="form-control" v-model="withdrawValue">
                </div>
                <input type="range" class="form-range" :min=withdrawMinLimit :max=user.goldcoin id="customRange2" v-model="withdrawValue">                
              </div>
              
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="closeWithdrawGold" class="btn btn-outline-danger btn-sm w-100 mb-1">{{ formData.button_cancel }}</div>
                <button @click="withdrawGoldcoin" class="btn btn-success btn-sm w-100">{{ formData.button_withdraw }}</button>
              </div>
            </div>

            <!-- Withdraw block - Goldcoins are on the account - false -->
            <div v-if="user.owner && divWithdrawVisible && user.goldcoin < withdrawMinLimit" class="row align-items-center d-flex">
              <div class="col-md-1 align-items-center d-flex">
              </div>
              <div class="col-md-9 align-items-center d-flex flex-wrap">
                <div class="text-jusitify">
                  <p>
                    {{ formData.text_no_enough_gold }} <b>{{ withdrawMinLimit }}</b>
                  </p>                
                </div>                
              </div>              
              
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="closeWithdrawGold" class="btn btn-outline-secondary btn-sm w-100 mb-1">{{ formData.button_clear }}</div>                
              </div>
            </div>

            <!-- USER DEMOCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.democoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_democoin"><b> {{ textNumber(user.democoin) }} </b></h5><br>
              </div>
              <div v-if="buttonVisibleDemo" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div @click="depositDemocoin" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_adddemocoin }}</div>
              </div>
            </div>
            <!-- USER BONUSCOIN -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.bonuscoin }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_bonuscoin"><b> {{ textNumber(user.bonuscoin) }} </b></h5><br>
              </div>
            </div>
            <!-- USER WALLET -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3" :title="formData.hint_wallet">{{ formData.wallet }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_wallet"><b> {{ user.wallet }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
              </div>
            </div>
            <!-- USER RIGISTRATION DATE -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.reg_date }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_reg_date"><b> {{ user.reg_date }} </b></h5><br>
              </div>
              <div class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
              </div>
            </div>
            <!-- USER REPUTATION 
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.reputation }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_reputation"><b> {{ textNumber(user.reputation) }} </b></h5><br>
              </div>
              <div v-if="buttonVisibleReview" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="goToReviewPage()" class="btn btn-secondary btn-sm w-100">{{ formData.button_comments }}</button>
              </div>
            </div>-->
            <!-- USER RATING -->
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.rating }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 :title="formData.hint_rating"><b> {{ textNumber(user.rating) }} </b></h5><br>
              </div>
              <div v-if="user.owner && buttonVisibleHistory" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="goToHistoryPage()" class="btn btn-secondary btn-sm w-100">{{ formData.button_gamehistory }}</button>
              </div>
            </div>
            <!-- USER REFERRAL LINK -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3" :title="formData.hint_ref_link">{{ formData.ref_link }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5   v-if="referalUrl !== ''" @click="copyToClipboard" @mouseover="hoveredRefLink = true" @mouseout="hoveredRefLink = false"
                    :title="formData.hint_ref_link_copy" 
                    :style="{ cursor: 'pointer', padding: 30, backgroundColor: hoveredRefLink ? 'royalblue' : '', borderRadius: hoveredRefLink ? '10px' : '', color: hoveredRefLink ? 'White' : '', }">
                    <b :class="{ 'm-2' : hoveredRefLink }"> {{referalUrl}} </b></h5>
                <h5 v-if="referalUrl === ''">{{ formData.no_ref_code }}</h5>
                <br>
              </div>
              <div v-if="buttonVisibleCode" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <h5 v-if="referalUrl !== ''" :title="formData.hint_ref_code"><b> {{user.referal_code}} </b></h5>
                <button v-if="referalUrl === ''" @click="getReferalLink()" class="btn btn-secondary btn-sm w-100">{{ formData.button_get_code}}</button>
              </div>
            </div>
            <!-- USER COUNTRY -->          
            <div class="row align-items-center d-flex" style="height: 36px;">
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.country }}</h5>
              </div>
              <div class="col-md-7 align-items-center d-flex">
                <h5 v-if="!editingCountry && user.owner" @click="startEditingCountry" style="cursor: pointer" :title="formData.hint_country">
                  <b v-if="states.find(state => state.id === country) && states.find(state => state.id === country).name !== null"> {{ states.find(state => state.id === country).name }} </b>                  
                </h5>
                <h5 v-if="editingCountry && user.owner">
                  <select class="form-select form-select-sm w-100" aria-label="Small select example" @change="stopChooseCountry" v-model="newCountry">                    
                    <option v-for="(state, id) in states" :key="id" :value="state" @mouseout="editingCountry = false">{{ state.name }}</option>
                  </select>
                </h5>
                <h5 v-if="!user.owner">
                  <b v-if="states.find(state => state.id === country) && states.find(state => state.id === country).name !== null"> {{ states.find(state => state.id === country).name }} </b>
                </h5>
                <br>
              </div>
              
              <div v-if="user.owner" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                
              </div>
            </div>
            <!-- USER PHONE -->
            <div v-if="user.owner" class="row align-items-center d-flex" style="height: 36px;">              
              <div class="col-md-3">
                <h5 class="me-3">{{ formData.phone }}</h5>
              </div>
              <div v-if="!editingPhone" class="col-md-7 align-items-center d-flex">
                <h5 v-if="!user.phone_is_verified" style="cursor: pointer" @click="startEditingPhone">
                  <b v-if="user.phone !== null"> {{ user.phone }} </b>
                  <b v-else> {{ formData.not_specified }} </b>
                </h5>
                <h5 v-if="user.phone_is_verified">
                  <b v-if="user.phone !== null"> {{ user.phone }} </b>
                  <b v-else> {{ formData.not_specified }} </b>
                </h5>
                <br>
              </div>              
              <div v-if="editingPhone" class="col-md-7 align-items-center d-flex">
                <input v-model="newPhone" class="form-control" />
              </div>
              
              <div v-if="!user.phone_is_verified && !editingPhone && user.phone === '' && buttonVisiblePhone" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <button @click="startEditingPhone" class="btn btn-outline-secondary btn-sm w-100">{{ formData.button_addphone }}</button>
              </div>
              <div v-if="!user.phone_is_verified && !editingPhone && user.phone != '' && buttonVisiblePhone" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center dropdown">
                <button class="btn btn-outline-secondary btn-sm w-100 dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">{{ formData.button_confirmphone }} </button>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li><a class="dropdown-item" @click="confirmPhone" style="cursor: pointer">{{ formData.button_confirmphone }}</a></li>
                  <li><a class="dropdown-item" @click="startEditingPhone" style="cursor: pointer">{{ formData.button_changephone }}</a></li>
                </ul>
              </div>              
              <div v-if="!user.phone_is_verified && editingPhone && buttonVisiblePhone" class="col-md-2 align-items-center d-flex flex-wrap justify-content-between">
                <button @click="cancelEditingPhone" class="btn btn-outline-danger btn-sm w-45">{{ formData.button_cancel }}</button>
                <button @click="submitChangePhone" class="btn btn-success btn-sm w-50">{{ formData.button_submit }}</button>
              </div>
              <div v-if="user.phone_is_verified" class="col-md-2 align-items-center d-flex flex-wrap justify-content-center">
                <div class="badge_confirmed w-100">🗹 {{ formData.button_confirmed }}</div>
              </div>                          
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .badge_confirmed {
    color: green;
    
    border-radius: 5px;
    text-align: center;
    cursor: default;
    font-weight: 600;
  }
</style>
