var now = new GlideDateTime();
 var saleDate = new GlideDateTime(gr.sale_date);
// Calculate the difference in days between now and sale date
var millisecondsDiff = now.getNumericValue() - saleDate.getNumericValue();
var daysDiff = Math.floor(millisecondsDiff / (1000 * 60 * 60 * 24)); // convert ms to days

if (daysDiff == 14) {
    // Do something
}else if(daysDiff >30){
    // Do something
}