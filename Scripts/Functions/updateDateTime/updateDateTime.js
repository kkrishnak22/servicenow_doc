     function setPlannedEndDate() {
        var cabMeetingDays = [1, 3, 5]; // Monday, Wednesday, Friday
        var cabCount = 0;
        var gdt = new GlideDate();
        var todayStr = gdt.getDate(); // "2025-07-04" // yyyy-mm-dd
        var date = new GlideDateTime(todayStr + " 00:00:00");
        // Count next 4 CAB meeting days
        while (cabCount < 4) {
            date.addDays(1);
            var dow = date.getDayOfWeek(); // 1 = Monday
            if (cabMeetingDays.indexOf(dow) !== -1) {
                cabCount++;
            }
        }
        // Add 7 PM (19:00:00) as seconds (19 * 3600 = 68400)
        date.addSeconds(68400);
        return date.toString();
    }

    var endDate = utils.setPlannedEndDate();
task.end_date = endDate;
task.end_date.setDisplayValue(endDate);