import { fetchPost } from "./common/web.js";
import { serverUrl } from "./common/def_global.js";

Init();
document.getElementById('daily_checked').addEventListener('change', checked_change);
document.getElementById('period_checked').addEventListener('change', checked_change);
document.getElementById('name').addEventListener('change', UserChanged);
document.getElementById('default_noon').addEventListener('change', DefaultChanged);
document.getElementById('default_night').addEventListener('change', DefaultChanged);
document.getElementById('default_tomorrow').addEventListener('change', DefaultChanged);
document.getElementById('btn_submit').addEventListener('click', SubmitData);

document.getElementById('daily_checked').dispatchEvent(new Event('change'));

async function Init()
{
    const content = {
        "method": "initeatingform"
    };
    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    if(result[0] != 200)
        return;

    const obj = document.getElementById('name');
    if(obj == null)
        return;
    for(var i=0; i<result[1].length; i++)
    {
        var opt = document.createElement('option');
        opt.innerHTML = result[1][i].UserName;
        opt.value = result[1][i].ID;
        obj.appendChild(opt);
    }
    if(result[1].length > 0)
        obj.dispatchEvent(new Event('change'));
}

async function UserChanged()
{
    const content = {
        "method": "geteatsetting",
        "data": {
            "UserID": this.value
        }
    };
    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    if(result[0] != 200 || result[1] == null)
        return;

    const allNoon = document.querySelectorAll('.cNoon');
    for(var i=0; i<allNoon.length; i++)
        allNoon[i].checked = result[1].NoonDefault;
    const allNight = document.querySelectorAll('.cNight');
    for(var i=0; i<allNight.length; i++)
        allNight[i].checked = result[1].NightDefault;
    const allTomorrow = document.querySelectorAll('.cTomorrow');
    for(var i=0; i<allTomorrow.length; i++)
        allTomorrow[i].checked = result[1].TomorrowDefault;
}

function DefaultChanged()
{
    var val = this.checked;
    var className = '.' + this.className;
    console.log(className);
    var allObj = document.querySelectorAll(className);
    for(var i=0; i<allObj.length; i++)
        allObj[i].checked = val;
}

async function SubmitData()
{
    event.preventDefault(); //prevent reloading html
    var content = {
        "method": "submiteatdata",
        "data": {
            "UserID": document.getElementById('name').value,
            "Default": {
                "Noon": document.getElementById('default_noon').checked,
                "Night": document.getElementById('default_night').checked,
                "Tomorrow": document.getElementById('default_tomorrow').checked
            },
            "Type": "",
            "Period": {},
            "OneDay": {}
        }
    }
    if(document.getElementById('daily').style.display == 'block')
    {
        content.data.Type = "OneDay";
        content.data.OneDay = {
            "Date": document.getElementById('daily_date').value,
            "Noon": document.getElementById('daily_noon').checked,
            "Night": document.getElementById('daily_night').checked,
            "Tomorrow": document.getElementById('daily_tomorrow').checked
        };
    }
    else if(document.getElementById('period').style.display == 'block')
    {
        content.data.Type = "Period";
        content.data.Period = {
            "StartDate": document.getElementById('period_start_date').value,
            "EndDate": document.getElementById('period_end_date').value,
            "Weekly": [{
                "Noon": document.getElementById('period_mon_noon').checked,
                "Night": document.getElementById('period_mon_night').checked,
                "Tomorrow": document.getElementById('period_mon_tomorrow').checked
            },
            {
                "Noon": document.getElementById('period_tue_noon').checked,
                "Night": document.getElementById('period_tue_night').checked,
                "Tomorrow": document.getElementById('period_tue_tomorrow').checked
            },
            {
                "Noon": document.getElementById('period_wed_noon').checked,
                "Night": document.getElementById('period_wed_night').checked,
                "Tomorrow": document.getElementById('period_wed_tomorrow').checked
            },
            {
                "Noon": document.getElementById('period_thu_noon').checked,
                "Night": document.getElementById('period_thu_night').checked,
                "Tomorrow": document.getElementById('period_thu_tomorrow').checked
            },
            {
                "Noon": document.getElementById('period_fri_noon').checked,
                "Night": document.getElementById('period_fri_night').checked,
                "Tomorrow": document.getElementById('period_fri_tomorrow').checked
            }]
        }
    }
    console.log(content);
    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    console.log(result);
    if(result[0] == 200)
        document.location.href="./done.html";
}

function checked_change()
{
    const type = this.id.split('_')[0];
    const allTabs = document.querySelectorAll('.ctab');
    for(var i=0; i<allTabs.length; i++)
        allTabs[i].style.display = 'none';
    document.getElementById(type).style.display = 'block';
}