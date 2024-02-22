export function trunc_10_3(textString) {
    try {                
        if (textString.length > 16) {
            return textString.slice(0, 10) + '...' + textString.slice(-3);
        } else {
            return textString;
        }
    }
    catch {
        console.error('truncatedNicknameText Error')
        return ''; // Вернуть пустую строку или другое значение по умолчанию
    }
}

export function trunc_9_4(textString) {
    try {                
        if (textString.length > 16) {
            return textString.slice(0, 9) + '...' + textString.slice(-4);
        } else {
            return textString;
        }
    }
    catch {
        console.error('truncatedNicknameText Error')
        return ''; // Вернуть пустую строку или другое значение по умолчанию
    }
}

export function trunc_55(textString) {
    try {                
        if (textString.length > 55) {
            return textString.slice(0, 25) + ' ... ' + textString.slice(-25);
        } else {
            return textString;
        }
    }
    catch {
        console.error('truncatedNicknameText Error')
        return ''; // Вернуть пустую строку или другое значение по умолчанию
    }
}

export function trunc_26(textString) {
    try {                
        if (textString.length > 26) {
            return textString.slice(0, 19) + '...' + textString.slice(-4);
        } else {
            return textString;
        }
    }
    catch {
        console.error('truncatedNicknameText Error')
        return ''; // Вернуть пустую строку или другое значение по умолчанию
    }
}

