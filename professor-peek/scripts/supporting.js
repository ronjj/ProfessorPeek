function colorText(number, isInverted) {
    //   If inverted, low numbers are good and high numbers are bad
      if (isInverted) {
        if (number === 0 || number === "N/A") {
            return "black";
          }
          if (number >= 4) {
            return "red";
          }
          if (number >= 3) {
            return "black";
          }
          else {
            return "green";
          }
      } else {
        if (number === 0 || number === "N/A") {
            return "black";
          }
          if (number >= 4) {
            return "green";
          }
          if (number >= 3) {
            return "black";
          }
          else {
            return "red";
          }
      }
    }
