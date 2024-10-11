export function json2CSV(objArray, sep: string = ',') {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    for(let key in array[0]) {
        if (str != '') {
            str += sep + key;
        } else {
            str = key;
        }
    }

    str += '\r\n';

    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if (line != '') line += sep

            line += array[i][index];
        }

        str += line + '\r\n';
    }

    return str;
}