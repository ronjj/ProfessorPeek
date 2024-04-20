export function colorText(number) {
    // 0 - 2
    if (number < 2) {
        return "red";
    // 2 - 3.75
    } else if (number < 3.75) {
        return "yellow";
    // 3.75 - 5
    } else if (number < 5) {
        return "green";
    }
    
    else {
        return "color: black;"; // or some other default color
    }
}