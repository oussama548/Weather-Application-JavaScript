//0- hiding the forecast section 
var Hours=document.getElementsByClassName('daily')[0];
var Week=document.getElementsByClassName('weekly')[0];
Hours.classList.add('hide');
Week.classList.add('hide');
var Location='';


//1- Setting the current date

function printFormatTime(day,hour,min,days){
    let date_card=document.getElementsByClassName('date')[0];
    if(hour<=9 && min<=9){
        date_card.textContent=`${days[day]}, 0${hour}:0${min}`;
    }
    else if(hour>9 && min<=9){
        date_card.textContent=`${days[day]}, ${hour}:0${min}`;
    }
    else{
        date_card.textContent=`${days[day]}, ${hour}:${min}`;
    }
}

let setDate=()=>{
    //spliting the date obj
    let curr_date=new Date();
    console.log(curr_date);
    let day=curr_date.getDay();console.log(day);
    var days=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    
    //the time
    let hour=curr_date.getHours();
    let min=curr_date.getMinutes();
    console.log(hour,min);
    //set the element
    printFormatTime(day,hour,min,days);
    
}

//2- transforming the entered location into coordinates
let getCoordinates=async (location)=>{
    const url="https://api.opencagedata.com/geocode/v1/json";
    
    try{
        let response=await fetch(`${url}?q=${location}&key=${key}`);
        if(!response.ok){
            throw Error("No location fetched");
        }
        let data=await response.json();
        // getting the latitude / longtitude
        let latitude=data.results[0].geometry.lat;
        let longtitude=data.results[0].geometry.lng;
        let arr=[latitude,longtitude];
        return arr;//returns array contain the coordinates
    }
    catch(error){
        console.log("error caught");
        throw error;
    }
}

//3- Getting the weather data from the API

let getWeather=async (location)=>{
    const url="https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
    

    try{
        let geometry=[];
        geometry=await getCoordinates(location);//we got the geolocation (coordinates)
        //now we get the weather forecast
        let response =await fetch(`${url}/${geometry[0]},${geometry[1]}?key=${APIKey}`);
        if(!response.ok){
            throw Error("No weather fetched");
            console.log("No weather fetched");
        }
        let data= await response.json();
        return data;
    }
    catch(error){
        console.log("weather/location error caught");
        throw error;// the thrown exception will be caught in the displaying functions
    }
}

//4- display the weather information on the app

//a- display the sideBar info
let SideBarData=async (location)=>{
    try{
        //getting data
    let weather=await getWeather(location);
    
    console.log(weather);
    //now we display on the page
    const sideImg=document.getElementsByClassName('big-img')[0];
    const degree=document.getElementsByClassName('degree')[0];
    const city=document.getElementsByClassName('city')[0];
    const cityState=document.getElementsByClassName('cityState')[0];

    let temp =weather.currentConditions.temp;
    let icon=weather.currentConditions.icon;
    let srce=source(icon);
    celsius=(temp-32)*5/9;
    degree.textContent=celsius.toFixed(1)+'°';
    cityState.textContent=weather.currentConditions.conditions;
    city.textContent=location;
    //setting the image
    sideImg.src=srce;


    }catch(error){
        throw error;
    }
    


}

//b- dsiplay the daily forecast data
let dayHoursData=async (location)=>{
    try{
        let weather=await getWeather(location);
        let hours=[];
   
     
   for(let i=0;i<24;i++){
        let hour={};
        hour.time= weather.days[0].hours[i].datetime;
        let tmp=weather.days[0].hours[i].temp;
        tmp=(tmp-32)*5/9;
        hour.temp=tmp.toFixed(1);
        hour.icon=weather.days[0].hours[i].icon;
        hours.push(hour);
    }
    //console.log(hours);

    let hourCard=document.getElementsByClassName('h-card');
    hourCard=Array.from(hourCard);
    for(let i=0;i<24;i++){
        let src;
        if(hours[i].icon=='clear-night')src="icons/night.png";
        else if(hours[i].icon=='clear-day')src="icons/contrast.png";
        else if(hours[i].icon=='partly-cloudy-day')src="icons/cloudy.png";
        else if(hours[i].icon=='rain')src="icons/heavy-rain.png";
        else if(hours[i].icon=='cloudy')src="icons/clouds.png";
        else if(hours[i].icon=='partly-cloudy-night')src="icons/cloudyNight.png";

        hourCard[i].innerHTML=`
        <div class="h-card">
                    <p class="h_time">${hours[i].time}</p>
                    <img class='h_img' src="${src}">
                    <p class="h_degree">${hours[i].temp}</p>
                </div>

        `
    }

    }catch(error){
        throw error;
    }

    
    

}

//c- display the weekly forecast
let weekData=async (location)=>{

    let weather=await getWeather(location);

    let weekCard=document.getElementsByClassName('w-card');
    weekCard=Array.from(weekCard);

    let weekDays=[];

    for(let i=0;i<7;i++){
        let day={};
        day.date=getDate(`${weather.days[i+1].datetime}`);
        day.icon=weather.days[i+1].icon;
        let temp=weather.days[i+1].temp;
        temp=(temp-32)*5/9;
        day.tmp=temp.toFixed(1);
        weekDays.push(day);
    }
    console.log(weekDays);

    //now we fill the cards on the page
    for(let i=0;i<7;i++){
        src=source(weekDays[i].icon);
        weekCard[i].innerHTML=`
        <div class="w-card">
                    <p class="w-time">${weekDays[i].date}</p>
                    <img class="w-img" src="${src}">
                    <p class="w-degree">${weekDays[i].tmp}°</p>
        </div>
        `
    }

}

//d_ display the state of the day
let stateData=async (location)=>{
    try{
        let weather=await getWeather(location);

    let rise=weather.currentConditions.sunrise;
    rise=Array.from(rise);let sunRise=''
    for(let i=0;i<5;i++){
        sunRise+=rise[i];
    }


    let set=weather.currentConditions.sunset;
    set=Array.from(set);let sunSet='';
    for(let i=0;i<5;i++){
        sunSet+=set[i];
    }


    let state=document.getElementsByClassName('statCard');
    state=Array.from(state);
    state[0].innerHTML=`
    <div class="statCard">
                        <p class="title">UV Index</p>
                        <p class="number">${weather.currentConditions.uvindex}</p>
    </div>
    `
    state[1].innerHTML=`
    <div class="statCard">
                        <p class="title">Wind Status</p>
                        <p class="number">${weather.currentConditions.windspeed}</p>
    </div>
    `
    state[2].innerHTML=`
    <div class="statCard">
                        <p class="title">Sunrise</p>
                        <p class="number">${sunRise}</p>
    </div>
    `
    state[3].innerHTML=`
    <div class="statCard">
                        <p class="title">Sunset</p>
                        <p class="number">${sunSet}</p>
    </div>
    `

    state[4].innerHTML=`
    <div class="statCard">
                        <p class="title">Humidity</p>
                        <p class="number">${weather.days[0].humidity}%</p>
    </div>
    `
    state[5].innerHTML=`
    <div class="statCard">
                        <p class="title">Visiblity</p>
                        <p class="number">${weather.currentConditions.visibility}</p>
    </div>
    `


    }catch(error){
        throw error;
    }
    

}


//Helping functions ->

// 1- function that returns the week day from the full date
let getDate=(date)=>{
    let newd=new Date(`${date}`);
    if(newd.getDay()==0)return 'Sunday';
    else if(newd.getDay()==1)return 'Monday';
    else if(newd.getDay()==2)return 'Tuesday';
    else if(newd.getDay()==3)return 'Wednesday';
    else if(newd.getDay()==4)return 'Thursday';
    else if(newd.getDay()==5)return 'Friday';
    else if(newd.getDay()==6)return 'Saturday';
}

// 2- function that returns the appropriate source
let source=(icon)=>{
    if(icon=='rain')return "icons/heavy-rain.png";
    else if(icon=='partly-cloudy-day') return "icons/cloudy.png";
    else if(icon=='clear-day') return "icons/contrast.png";
    else if(icon=='cloudy') return "icons/clouds.png";   
}

//defining the toggle elements (week-day)
const day=document.getElementsByClassName('today')[0];
const week=document.getElementsByClassName('week')[0];



//1- click on search -> recieving input
const input=document.getElementsByClassName('input')[0];
const search_btn=document.getElementsByClassName('search_btn')[0];
search_btn.addEventListener('click',async ()=>{
    try{
        Location=input.value; //global
        let hours=document.getElementsByClassName('daily')[0];
        let week=document.getElementsByClassName('weekly')[0];
        //a- let the hours section appear
        if(hours.classList.contains('hide')){
            hours.classList.remove('hide');
        }
        //b- hide the week-days section
        if(!week.classList.contains('hide')){
            week.classList.add('hide');
        }
        await dayHoursData(Location);
        await SideBarData(Location);
        await stateData(Location);
    }
    catch(error){
        //display error message
        let content=document.getElementsByClassName('content')[0];
        let side=document.getElementsByClassName('side-bar')[0];
        content.setAttribute('class','error');
        side.setAttribute('class','error');
        content.innerHTML=`
        Sorry,the enterd location is not valid!!<b>Please ensure correct input!!
        `
        side.innerHTML=`
        No content available
        `
    }

})



//2- click on day -> display the daily forecast
day.addEventListener('click',async ()=>{
    //1- make the day 
    const daily=document.getElementsByClassName('daily')[0];
    if(daily.classList.contains('hide')){
        daily.classList.remove('hide');
    }
    //2- remove the week section
    let weekly=document.getElementsByClassName('weekly')[0];
    if(!weekly.classList.contains('hide')){
        weekly.classList.add('hide');
    }
    //3-display the hourly forecast
    await dayHoursData(Location);
})



//3- click on week -> displaying the week state 
week.addEventListener('click',async()=>{
    //1- make the week
    let weekly=document.getElementsByClassName('weekly')[0];
    if(weekly.classList.contains('hide')){
        weekly.classList.remove('hide');
    }
    //2- remove the daily section
    let daily=document.getElementsByClassName('daily')[0];
    if(!daily.classList.contains('hide')){
        daily.classList.add('hide');
    }
    //3- displaying the weekly forecast
    await weekData(Location);

})
