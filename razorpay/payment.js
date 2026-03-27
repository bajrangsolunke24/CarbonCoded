
function paymentProcess() {



    var options = {
        "key": "rzp_test_PpOinqLyVBHOcP", 
        "amount": 320*100, 
        "currency": "INR",
        "name": "Devotional Study",
        "description": "Tutorial",
        "image": "logo.png",// Replace this with the order_id created using Orders API (https://razorpay.com/docs/api/orders).
        "handler": function (response){
            savetoDB(response);
            $('#myModal').modal();
        },
        "prefill": {
            "name": "Akshay Bhatia",
            "email": "akshay.bhatia@gmail.com",
            "contact": "9999999999"
        },
        "notes": {
            "address": "note value"
        },
        "theme": {
            "color": "#9932CC"
        }
    }
    var propay = new Razorpay(options);
    propay.open();
}


function savetoDB(response) {
    console.log(response)
    var payRef = firebase.database().ref('payment');

    payRef.child('123456789').set({
    payment_id : response.razorpay_payment_id
    })
}