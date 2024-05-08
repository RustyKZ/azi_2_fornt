<template>
    <div>
      <!-- Кнопка PayPal -->
      <div ref="paypalButton"></div>
    </div>    
</template>
  
<script>
import { ref, onMounted } from 'vue'
import { loadScript } from '@paypal/paypal-js'
import { paypalClientId } from '../main';

// const emits = defineEmits(['paypalSuccess', 'paypalError']);

export default {
    name: 'PaypalDonation',
    
    props: {
      DonationValue: {
        type: Number,
        required: true
      },
    },
    created() {
        console.log('PAYPAL DONATION - created...');
    },
    
    mounted() {
        console.log('PAYPAL DONATION - mounted...');
    },
    
    setup(props, {emit}) {
        try {
            console.log('PAYPAL DONATION - setup...');
            const paypalButton = ref(null);
            onMounted(() => {
                console.log('PAYPAL DONATION - onMounted');
                if (!Number.isInteger(props.DonationValue) || props.DonationValue <= 0) {
                    console.log('PAYPAL DONATION - incorrect value');
                    emit('paypalError', {'error': 651, 'error_data': 'Enter incorrect'});                    
                    return; // Завершаем выполнение функции, если ввод некорректен
                } else {
                    console.log('PAYPAL DONATION - correct value');
                // Загрузка SDK PayPal
                // 'ATVtjFAQiW84uJSCELJDy89J8MA-u6ldK_k9FlSqkXcuDad7DRfi3L9DBFxbL5O9RWyujt5VOnqWWZuh'
                loadScript({ 'client-id': paypalClientId }).then(() => {
                    // Инициализация кнопки PayPal
                    window.paypal.Buttons({
                        createOrder: function(data, actions) {
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: props.DonationValue.toString(),
                                        currency_code: 'USD'
                                    }
                                }]
                            });
                        },
                        onApprove: function(data, actions) {
                            return actions.order.capture().then(function(details) {
                                // Обработка успешного платежа
                                //console.log('Payment successful:', details, ' Server URL is ', serverUrl);
                                emit('paypalSuccess', details);
                            });
                        },
                        onError: function(err) {
                            // Обработка ошибки платежа
                            // console.error('Payment error:', err);
                            emit('paypalError', {'error': 652, 'error_data': err});
                        }
                    }).render(paypalButton.value)
                })
            }
            })      
            return { paypalButton }
        } catch(error) {
            emit('paypalError', {'error': 650, 'error_data': error});
        }
    }
}
</script>
  
<style scoped>
/* Стили для вашей кнопки PayPal */
</style>
  