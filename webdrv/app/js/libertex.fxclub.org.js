(function() {

    var source_id = 'libertex_fxclub'
    function sendData() {
        var SymbolsNodesList = document.querySelectorAll('div.products-list div.row div.icon-product a');
        var ValuesNodesList = document.querySelectorAll('div.products-list div.row div[class="col col-rate"] span');
        if (ValuesNodesList.length == 0)
            ValuesNodesList = document.querySelectorAll('div.products-list div.row div[class="col col-rate"]');
        var count = Math.min(SymbolsNodesList.length, ValuesNodesList.length);
        var timestamp = (new Date()).getTime();
        var data = [];
        for (var i = 0; i < count; i++){
            var item = {symbol: SymbolsNodesList[i].href.split('/')[5], value: ValuesNodesList[i].innerHTML, timestamp: timestamp, source_id: source_id};
            data.push(item);
        }
        $.ajax({
              url:'http://127.0.0.1/data',
              type:"POST",
              data: JSON.stringify({data: data}),
              contentType:"application/json; charset=utf-8",
              dataType:"json",
              success: function(res){
                  console.log(res);
              }
        });

    }
    document.querySelectorAll('label.switcher-label')[1].click(); //select tab without category
    setInterval(sendData, 1000);


})();

window.onload = function () {
    document.querySelectorAll('label.switcher-label')[1].click(); //select tab without category
};
