document.querySelectorAll('.hide-classes-toggle').forEach(function(toggle) {
    toggle.addEventListener('change', function() {
        if (this.checked) {
            console.log('Toggle on');
            // Additional actions when the toggle is turned on
        } else {
            console.log('Toggle off');
            // Additional actions when the toggle is turned off
        }
    });
});
