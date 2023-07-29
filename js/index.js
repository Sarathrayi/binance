
let selectedSymbol = "ltcbtc"; // Default trading pair

$(document).ready(function() {

  
    
    
    $.ajax({
      url: "https://api.binance.com/api/v3/exchangeInfo",
      method: "GET",
      success: function(data) {
        populateDropdown(data.symbols);
      },
      error: function(error) {
        alert("Failed to fetch trading pairs:", error)
        console.error("Failed to fetch trading pairs:", error);
      }
    });
  
});


function populateDropdown(symbols) {
    const $dropdown = $("#symbol");

    symbols.forEach(function(symbolData) {
      const symbol = symbolData.symbol;
      $dropdown.append(`<option value="${symbol}">${symbol}</option>`);
    });

    
    $dropdown.on("change", function() {
      selectedSymbol = $(this).val();
      connectWebSocket(selectedSymbol);
    });

    
    connectWebSocket(selectedSymbol);
  }

  function spinner(isShow){
    if(isShow){
        $("#main-content").hide();
        $("#loader").show();
    }else{
        $("#main-content").show();
        $("#loader").hide();
    }
  }

  let socket; 

  function connectWebSocket(symbol) {
    
    spinner(true)
    if (socket) {
      socket.close();
    }

    const websocketUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth`;

    socket = new WebSocket(websocketUrl);

    socket.onopen = function() {
      console.log("WebSocket connection established!");
    };

    

    socket.onmessage = function(event) {
        spinner(false)
        
      const data = JSON.parse(event.data);
      
      updateOrderBook(data);
    };

    socket.onclose = function(event) {
      console.log("WebSocket connection closed!");
    };

    socket.onerror = function(error) {
        alert("WebSocket error:", error)
      console.error("WebSocket error:", error);
    };
  }

  function updateOrderBook(orderBookData) {

    console.log(orderBookData);
    const currentPrice = parseFloat(orderBookData.b[0][0]).toFixed(8);
    $("#price").text(`Latest Bid Price: ${currentPrice}`);


    const highPrice = parseFloat(orderBookData.a[orderBookData.a.length - 1][0]).toFixed(8);
    const lowPrice = parseFloat(orderBookData.b[orderBookData.b.length - 1][0]).toFixed(8);
    $("#24hHighLow").text(`24h High/Low: ${highPrice} / ${lowPrice}`);

    const bidArr = orderBookData.b
    const askArr = orderBookData.b
    var bidTable  = ''
    bidArr.map((arr) =>{
        var price = arr[0];
        var quantity = arr[1];
        bidTable += `
        <tr>
            <td>${price}</td>
            <td>${quantity}</td>
        </tr>
        `
    })
    var askTable  = ''
    askArr.map((arr) =>{
        var price = arr[0];
        var quantity = arr[1];
        askTable += `
        <tr>
            <td>${price}</td>
            <td>${quantity}</td>
        </tr>
        `
    })
    
    $("#bidBody").html(bidTable)
    $("#askBody").html(askTable)

  }  