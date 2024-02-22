export async function get_ip_address() {
    try {
        // Отправляем запрос к сервису для получения IP-адреса
        const response = await fetch('https://api.ipify.org?format=json');
        
        // Проверяем, что статус ответа успешный
        if (!response.ok) {
            throw new Error('Failed to fetch IP address');
        }
        
        // Получаем данные ответа в формате JSON
        const data = await response.json();
        
        // Возвращаем IP-адрес из данных ответа
        return data.ip;
    } catch (error) {
        console.error('Error getting IP address:', error);
        return '0.0.0.0'; // Возвращаем 0.0.0.0 в случае ошибки
    }
}