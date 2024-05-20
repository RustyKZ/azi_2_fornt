import Web3 from 'web3';
import { serverUrl } from '../main'
import axios from 'axios';
import { get_ip_address } from './ip_address';
import store from './storage';

export async function walletConnect(refCode, language) {
    try {
        const response = await axios.get(`${serverUrl}/api/get_token_settings`);
        //console.log('WALLET CONNECT - GET TOKEN SETTINGS response :', response);
        if (response.data['status']) {
            const tokenContractAddress = response.data.token['contract'];
            if (typeof window.ethereum !== 'undefined') {
                const web3 = new Web3(window.ethereum);
                try {
                    // Запрос разрешения на доступ к аккаунту
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    // Проверяем, является ли сеть BSC
                    const networkId = await web3.eth.net.getId();
                    if (networkId == 56) {
                        // Сеть BNB Smart Chain
                        const userAddress = accounts[0];            
                        // Здесь должно быть ABI вашего контракта
                        // Пример:
                        const tokenContractAbi = [{
                            constant: true,
                            inputs: [{ name: 'owner', type: 'address' }],
                            name: 'balanceOf',
                            outputs: [{ name: '', type: 'uint256' }],
                            type: 'function',
                        }];
                        const tokenContract = new web3.eth.Contract(tokenContractAbi, tokenContractAddress);
                        const balance = await tokenContract.methods.balanceOf(userAddress).call();
                        // Подписывание данных
                        const dataToSign = 'User address: ' + userAddress
                        const ip_address = await get_ip_address();
                        const signature = await web3.eth.personal.sign(
                            JSON.stringify(dataToSign),
                            userAddress, // адрес для подписи
                            '' // пароль кошелька (может быть пустым, если кошелек разблокирован)
                        );
                        //console.log('Signed:',dataToSign)
                        const dataToSend = {
                            userAddress: userAddress,
                            tokenBalance: balance.toString(),
                            signature: signature,
                            ref_code: refCode,
                            ip_address: ip_address,
                            language: language
                        };
                        //console.log(dataToSend);
                        //console.log(`WALLET CONNECT: Request for ${serverUrl}/api/user_login_metamask`, dataToSend)
        
                        try {
                            const response = await axios.post(`${serverUrl}/api/user_login_metamask`, dataToSend);
                            //console.log('WALLET CONNECT - Server response:', response.data.message);
                            if (response.data['logged_in']) {
                                localStorage.setItem('authToken', response.data['access_token']);
                                store.dispatch('changeStatusLoggedIn');
                                store.dispatch('changeStatusWeb3In');
                                return response.data; // Возвращаем данные из сервера
                            } else {
                                const negative_response = {'logged_in': false, 'error': response.data['code']};
                                return negative_response;
                            }                            
                        } catch (error) {
                            console.error('Error sending data to server:', error);
                            const negative_response = {'logged_in': false, 'error': 602};
                            return negative_response;
                        }                
                    } else {
                        // Пользователь должен переключить Metamask для использования сети BSC
                        console.error('Please switch Metamask to use BNB Smart Chain');
                        const negative_response = {'logged_in': false, 'error': 603};
                        return negative_response;
                    }            
                } catch (error) {                        
                    console.error('Error connecting to Metamask:', error);
                    const negative_response = {'logged_in': false, 'error': 600};
                    return negative_response;
                }
            } else {
                console.error('Metamask is not installed in your browser.');
                const negative_response = {'logged_in': false, 'error': 601};
                return negative_response;
            }
        } else {
            const negative_response = {'logged_in': false, 'error': response.data.error};
            return negative_response;    
        }
        
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'logged_in': false, 'error': 602};
        return negative_response;        
    }
    
}
