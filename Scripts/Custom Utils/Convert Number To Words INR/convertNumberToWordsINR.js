function convertNumberToWordsINR(num) {
    if (num === 0) {
        return "Zero";
    }

    if (num < 0) {
        return "Minus " + convertNumberToWordsINR(Math.abs(num));
    }

    var units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    var teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    var tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

    // Helper function to convert numbers less than one thousand (same as before)
    function convertLessThanOneThousand(n) {
        var result = "";
        if (n >= 100) {
            result += units[Math.floor(n / 100)] + " Hundred ";
            n %= 100;
        }
        if (n >= 20) {
            result += tens[Math.floor(n / 10)] + " ";
            n %= 10;
        }
        if (n >= 10) {
            result += teens[n - 10] + " ";
            n = 0;
        }
        if (n > 0) {
            result += units[n] + " ";
        }
        return result.trim();
    }

    var result = "";
    var crore = 10000000; // 1,00,00,000
    var lakh = 100000;    // 1,00,000
    var thousand = 1000;

    // Handle Crores
    if (num >= crore) {
        // Recursively convert the crores part
        result += convertNumberToWordsINR(Math.floor(num / crore)) + " Crore ";
        num %= crore;
    }
    // Handle Lakhs
    if (num >= lakh) {
        // Recursively convert the lakhs part
        result += convertNumberToWordsINR(Math.floor(num / lakh)) + " Lakh ";
        num %= lakh;
    }
    // Handle Thousands
    if (num >= thousand) {
        result += convertLessThanOneThousand(Math.floor(num / thousand)) + " Thousand ";
        num %= thousand;
    }

    // Handle remaining part (less than 1000)
    result += convertLessThanOneThousand(num);

    return result.trim();
}