import Web3 from 'web3';
import axios from 'axios';
import { serverUrl } from '../main'

export async function tokenTransfer(tokenValue) {
    try {
        const response = await axios.get(`${serverUrl}/api/get_token_settings`);
        console.log('WALLET CONNECT - GET TOKEN SETTINGS response :', response);
        if (response.data['status']) {
            const tokenData = response.data.token;
            console.log('/token.js/ async FUNCTION TOKENTRANSFER : tokendata is', tokenData, 'tokenvalue is', tokenValue);
            const tokenValueBig = tokenValue.toString() + '000000000000000000';

            if (typeof window.ethereum !== 'undefined') {
                //console.log(' typeof window.ethereum !== undefined - DONE');
                const web3 = new Web3(window.ethereum);
        
                try {
                    // Запрос разрешения на доступ к кошельку пользователя
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const userAddress = accounts[0];                    
                    // Адрес контракта пользовательского токена
                    const contractAddress = tokenData['contract'];        
                    const tokenABI = tokenData['abi'];
                    const hostWalletAddress = tokenData['host_wallet'];
                    const gasValue = tokenData['gas']
                    // Создаем экземпляр контракта токена
                    const contract = new web3.eth.Contract(tokenABI, contractAddress);                    
                    // Подготовка данных для транзакции
                    const data = contract.methods.transfer(hostWalletAddress, tokenValueBig).encodeABI();
                    //console.log(' contract.methods.transfer - DONE')
                    // Отправка транзакции через MetaMask
                    const transactionHash = await web3.eth.sendTransaction({
                        from: userAddress,
                        to: contractAddress,
                        gas: gasValue,
                        data: data,
                    });
                    // Транзакция отправлена успешно
                    console.log(`Транзакция успешно отправлена: ${tokenValue} токенов переведены на адрес ${hostWalletAddress}`);
                    return {'status': true, 'hash': transactionHash};

                } catch (error) {
                    console.error('Ошибка отправки транзакции:', error);
                    const negative_response = {'status': false, 'error': 0};
                    return negative_response;
                }

            } else {                
                console.error('Metamask not found. Please install it, connect your account and try again');
                const negative_response = {'status': false, 'error': 602};
                return negative_response;
            }

        } else {
            console.error('Error connecting to Metamask:');
            const negative_response = {'status': false, 'error': 602};
            return negative_response;    
        }
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'status': false, 'error': 602};
        return negative_response;        
    }
}

export async function getTokenAmount() {
    try {
        const response = await axios.get(`${serverUrl}/api/get_token_settings`);
        console.log('WALLET CONNECT - GET TOKEN SETTINGS response :', response);
        if (response.data['status']) {
            const tokenData = response.data.token;
            const tokenContractAddress = tokenData['contract'];
            if (typeof window.ethereum !== 'undefined') {
                const web3 = new Web3(window.ethereum);
                try {                    
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });                    
                    const networkId = await web3.eth.net.getId();
                    if (networkId == 56) {                        
                        const userAddress = accounts[0];                        
                        const tokenContractAbi = tokenData['abi']
                        const tokenContract = new web3.eth.Contract(tokenContractAbi, tokenContractAddress);
                        const balance = await tokenContract.methods.balanceOf(userAddress).call();
                        let bigIntValue = balance;
                        let strValue = bigIntValue.toString();
                        let intBalance = Number(strValue.substring(0, strValue.length - 18));
                        return {'status': true, 'balance': intBalance}
                     
                    } else {
                        console.error('Please switch Metamask to use BNB Smart Chain');
                        const negative_response = {'status': false, 'error': 603};
                        return negative_response;
                    }            
                } catch (error) {                        
                    console.error('Error connecting to Metamask:', error);
                    const negative_response = {'status': false, 'error': 600};
                    return negative_response;
                }
            } else {
                console.error('Metamask is not installed in your browser.');
                const negative_response = {'status': false, 'error': 601};
                return negative_response;
            }

        } else {
            console.error('Error connecting to Metamask:');
            const negative_response = {'status': false, 'error': 602};
            return negative_response;    
        }
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'status': false, 'error': 602};
        return negative_response;        
    }
}

export async function getSignature() {
    try {
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
                    // Подписывание данных
                    const dataToSign = 'User address: ' + userAddress                        
                    const signature = await web3.eth.personal.sign(
                        JSON.stringify(dataToSign),
                        userAddress, // адрес для подписи
                        '' // пароль кошелька (может быть пустым, если кошелек разблокирован)
                    );
                    console.log('Signed:',dataToSign)
                    const positiveResponse = {
                        'signed': true,
                        'userAddress': userAddress,                            
                        'signature': signature
                    };                    
                    console.log(`WALLET SIGNATURE: `, positiveResponse);
                    return positiveResponse;
                } else {
                    // Пользователь должен переключить Metamask для использования сети BSC
                    console.error('Please switch Metamask to use BNB Smart Chain');
                    const negative_response = {'signed': false, 'error': 603};
                    return negative_response;
                }            
            } catch (error) {                        
                console.error('Error connecting to Metamask:', error);
                const negative_response = {'signed': false, 'error': 600};
                return negative_response;
            }
        } else {
            console.error('Metamask is not installed in your browser.');
            const negative_response = {'signed': false, 'error': 601};
            return negative_response;
        }        
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'signed': false, 'error': 602};
        return negative_response;        
    }    
}

export async function getWalletAmount() {
    try {
        const contractAddressUSDT = '0x55d398326f99059fF775485246999027B3197955'
        if (typeof window.ethereum !== 'undefined') {
            const web3 = new Web3(window.ethereum);
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });                    
                const networkId = await web3.eth.net.getId();
                if (networkId == 56) {                        
                    const userAddress = accounts[0];
                    const tokenContractAbi = [{
                        constant: true,
                        inputs: [{ name: 'owner', type: 'address' }],
                        name: 'balanceOf',
                        outputs: [{ name: '', type: 'uint256' }],
                        type: 'function',
                    }];                    
                    const tokenContractUSDT = new web3.eth.Contract(tokenContractAbi, contractAddressUSDT);
                    const balanceBNB = await web3.eth.getBalance(userAddress);
                    const balanceUSDT = await tokenContractUSDT.methods.balanceOf(userAddress).call();
                    let bigIntValueBNB = balanceBNB;
                    let bigIntValueUSDT = balanceUSDT;
                    let strValueBNB = bigIntValueBNB.toString();
                    let strValueUSDT = bigIntValueUSDT.toString();
                    let intBalanceBNB = Number(strValueBNB.substring(0, strValueBNB.length - 16))/100;
                    let intBalanceUSDT = Number(strValueUSDT.substring(0, strValueUSDT.length - 18));
                    return {'status': true, 'balance_bnb': intBalanceBNB, 'balance_usdt': intBalanceUSDT,}
                     
                } else {
                    console.error('Please switch Metamask to use BNB Smart Chain');
                    const negative_response = {'status': false, 'error': 603};
                    return negative_response;
                }            
            } catch (error) {                        
                console.error('Error connecting to Metamask:', error);
                const negative_response = {'status': false, 'error': 600};
                return negative_response;
            }
        } else {
            console.error('Metamask is not installed in your browser.');                
            const negative_response = {'status': false, 'error': 601};
            return negative_response;
        }

    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'status': false, 'error': 602};
        return negative_response;        
    }
}

export async function tokenTransferUSDT(tokenValue) {
    try {
        const response = await axios.get(`${serverUrl}/api/get_token_settings`);
        console.log('WALLET CONNECT - GET TOKEN SETTINGS response :', response);
        if (response.data['status']) {
            const tokenData = response.data.token;
            console.log('/token.js/ async FUNCTION TOKENTRANSFER : tokendata is', tokenData, 'tokenvalue is', tokenValue);
            const tokenValueBig = tokenValue.toString() + '000000000000000000';

            if (typeof window.ethereum !== 'undefined') {
                //console.log(' typeof window.ethereum !== undefined - DONE');
                const web3 = new Web3(window.ethereum);
        
                try {
                    // Запрос разрешения на доступ к кошельку пользователя
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const userAddress = accounts[0];                    
                    // Адрес контракта и ABI токена USDT Bep-20
                    const contractAddress = '0x55d398326f99059fF775485246999027B3197955';
                    const tokenABI = [{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[],"name":"_decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"_symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burn","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"getOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"}];
                    const hostWalletAddress = tokenData['host_wallet'];
                    const gasValue = tokenData['gas'] * 2
                    // Создаем экземпляр контракта токена
                    const contract = new web3.eth.Contract(tokenABI, contractAddress);                    
                    // Подготовка данных для транзакции
                    const data = contract.methods.transfer(hostWalletAddress, tokenValueBig).encodeABI();
                    //console.log(' contract.methods.transfer - DONE')
                    // Отправка транзакции через MetaMask
                    const transactionHash = await web3.eth.sendTransaction({
                        from: userAddress,
                        to: contractAddress,
                        gas: gasValue,
                        data: data,
                    });
                    // Транзакция отправлена успешно
                    console.log(`Транзакция успешно отправлена: ${tokenValue} токенов переведены на адрес ${hostWalletAddress}`);
                    return {'status': true, 'hash': transactionHash};

                } catch (error) {
                    console.error('Ошибка отправки транзакции:', error);
                    const negative_response = {'status': false, 'error': 0};
                    return negative_response;
                }

            } else {                
                console.error('Metamask not found. Please install it, connect your account and try again');
                const negative_response = {'status': false, 'error': 602};
                return negative_response;
            }

        } else {
            console.error('Error connecting to Metamask:');
            const negative_response = {'status': false, 'error': 602};
            return negative_response;    
        }
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'status': false, 'error': 602};
        return negative_response;        
    }
}

export async function bnbTransfer(bnbValue) {
    try {
        const response = await axios.get(`${serverUrl}/api/get_token_settings`);
        console.log('WALLET CONNECT - GET TOKEN SETTINGS response :', response);
        if (response.data['status']) {
            const tokenData = response.data.token;
            console.log('/token.js/ async FUNCTION BNB TRANSFER : token data is', tokenData, 'bnb value is', bnbValue);
            const bnbValueWei = Web3.utils.toWei(bnbValue.toString(), 'ether');

            if (typeof window.ethereum !== 'undefined') {
                const web3 = new Web3(window.ethereum);
        
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    const userAddress = accounts[0];                    
                    const hostWalletAddress = tokenData['host_wallet'];
                    const gasValue = tokenData['gas'];
                    
                    // Отправка BNB на кошелек сервиса
                    const transactionHash = await web3.eth.sendTransaction({
                        from: userAddress,
                        to: hostWalletAddress,
                        value: bnbValueWei,
                        gas: gasValue,
                    });
                    console.log(`bnbTRANSFER - Транзакция успешно отправлена: ${bnbValue} BNB переведены на адрес ${hostWalletAddress}`);
                    return {'status': true, 'hash': transactionHash};

                } catch (error) {
                    console.error('Ошибка отправки транзакции:', error);
                    const negative_response = {'status': false, 'error': 0};
                    return negative_response;
                }

            } else {                
                console.error('Metamask not found. Please install it, connect your account and try again');
                const negative_response = {'status': false, 'error': 602};
                return negative_response;
            }

        } else {
            console.error('Error connecting to Metamask:');
            const negative_response = {'status': false, 'error': 602};
            return negative_response;    
        }
    } catch(error) {
        console.error('Error connecting to Metamask:', error);
        const negative_response = {'status': false, 'error': 602};
        return negative_response;        
    }
}