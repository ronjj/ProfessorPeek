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

    function parseTime(timeStr) {
      if (typeof timeStr !== 'string') {
          throw new Error('Time must be a string in the format "HH:MMAM" or "HH:MMPM"');
      }
      const [time, period] = timeStr.split(/(?=[AP]M$)/i);
      let [hours, minutes] = time.split(':').map(Number);
  
      if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (period.toUpperCase() === "AM" && hours === 12) hours = 0;
  
      return hours * 60 + minutes;
  }
  
  function compareTimes(inputTime, filterTime, filterType) {
      if (typeof inputTime.textContent !== 'string' || typeof filterTime !== 'string') {
          console.log(inputTime, filterTime); 
          throw new Error('Both inputTime and filterTime must be strings.');
      }
      
      const inputMinutes = parseTime(inputTime.textContent.split(' - ')[0]);
      const filterMinutes = parseTime(filterTime.split(' - ')[0]);
  
      if (filterType === "before") {
          return inputMinutes < filterMinutes;
      } else if (filterType === "after") {
          return inputMinutes > filterMinutes;
      } else {
          throw new Error("Invalid filter type specified. Use 'before' or 'after'.");
      }
  }