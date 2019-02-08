self.onmessage = messageHandler;


//Worker works on the received data and return the JSON object
function messageHandler(e) {
    var data = e.data;

    //Determine the average GPA
    var average = averageGPA(data['GPA9th'], data['GPA10th'], data['GPA11th'], data['GPA12th']);

    //Determine the total extracurricular hours
    var totalHours = totalExtracurricularHours(data['volunteer'], data['leadership'], data['activity']);

    // Send back the GPA data
    self.postMessage({'GPA9th': data['GPA9th'], 'GPA10th': data['GPA10th'], 
    'GPA11th': data['GPA11th'], 'GPA12th': data['GPA12th'],'averageGPA': average,
    'volunteer': data['volunteer'], 'leadership': data['leadership'], 'activity': data['activity'], 'totalHours': totalHours}
    );
}

//average the GPA while taking the grade into account
function averageGPA(GPA9th, GPA10th, GPA11th, GPA12th) {
    let divisor = 0;

    //The followings are used to determine the divisor
    if(!(GPA9th == 0)){
        divisor++;
    }
    if(!(GPA10th == 0)){
        divisor++;
    }
    if(!(GPA11th == 0)){
        divisor++;
    }
    if(!(GPA12th == 0)){
        divisor++;
    }

    if(divisor == 0){
        return 0;
    } else {
        return Math.round((GPA9th + GPA10th + GPA11th + GPA12th) / divisor * 100) / 100;
    }
}

//Simply return the total hours
function totalExtracurricularHours(volunteerHours, leadershipHours, activityHours){
    return (volunteerHours + leadershipHours + activityHours);
}
