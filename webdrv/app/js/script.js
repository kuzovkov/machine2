(function() {

    function sendData() {
        var value = document.querySelector('div[class="top bold inlineblock"] span').innerHTML;
        var symbol = document.querySelector('h1[class="float_lang_base_1 relativeAttr"]').innerHTML;
        var timestamp = (new Date()).getTime();
        $.post('http://127.0.0.1/data', {'symbol': symbol, 'value': value, 'timestamp': timestamp}, function (res) {
            console.log(res);
        });

    }

    setInterval(sendData, 1000);
})();
