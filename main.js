import { fetchPost } from "./common/web.js";
import { serverUrl } from "./common/def_global.js";

Init();
document.getElementById('default_checked').addEventListener('change', checked_change);
document.getElementById('daily_checked').addEventListener('change', checked_change);
document.getElementById('period_checked').addEventListener('change', checked_change);
document.getElementById('query_checked').addEventListener('change', checked_change);
document.getElementById('name').addEventListener('change', UserChanged);
document.getElementById('daily_date').addEventListener('change', DailyDateChanged);
document.getElementById('btn_submit').addEventListener('click', SubmitData);

document.getElementById('default_checked').dispatchEvent(new Event('change'));

async function Init()
{
    var dt = new Date();
    dt.setHours(8);
    document.getElementById('daily_date').value = dt.toISOString().substring(0,10);
    document.getElementById('period_start_date').value = dt.toISOString().substring(0,10);
    document.getElementById('query_start_date').value = dt.toISOString().substring(0,10);
    dt.setDate(dt.getDate() + 6);
    document.getElementById('period_end_date').value = dt.toISOString().substring(0,10);
    document.getElementById('query_end_date').value = dt.toISOString().substring(0,10);

    var fridayTomorrowObjs = document.querySelectorAll('.c_5_Tomorrow');
    for(var i=0; i<fridayTomorrowObjs.length; i++)
        fridayTomorrowObjs[i].disabled = true;

    var defaultObjs = document.querySelectorAll('.cDefault');
    for(var i=0; i<defaultObjs.length; i++)
        defaultObjs[i].addEventListener('change', DefaultChanged);

    const content = {
        "method": "initeatingform"
    };
    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    if(result[0] != 200)
        return;

    const obj = document.getElementById('name');
    if(obj == null)
        return;
    var opt_empty = document.createElement('option');
    opt_empty.innerHTML = '';
    opt_empty.value = 0;
    obj.appendChild(opt_empty);
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

function DailyDateChanged()
{
    var dt = new Date(this.value);
    if(dt.getDay() == 5)
    {
        document.getElementById('daily_tomorrow').disabled = true;
        document.getElementById('daily_tomorrow').checked = false;
    }
    else
        document.getElementById('daily_tomorrow').disabled = false;
}

async function UserChanged()
{
    if(this.value > 0)
        alert("選擇設定：" + this.options[this.selectedIndex].innerHTML);
    if(this.value == 0)
        document.getElementById('all_info').style.display = "none";
    else
        document.getElementById('all_info').style.display = "block";
    const content = {
        "method": "geteatsetting",
        "data": {
            "UserID": this.value
        }
    };
    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    if(result[0] != 200 || result[1] == null)
        return;

    for(var i=0; i<result[1].DefaultSetting.length; i++)
    {
        const allNoon = document.querySelectorAll('.c_' + (i+1) + '_Noon');
        for(var j=0; j<allNoon.length; j++)
            allNoon[j].checked = result[1].DefaultSetting[i].Noon;
        const allNight = document.querySelectorAll('.c_' + (i+1) + '_Night');
        for(var j=0; j<allNight.length; j++)
            allNight[j].checked = result[1].DefaultSetting[i].Night;
        const allTomorrow = document.querySelectorAll('.c_' + (i+1) + '_Tomorrow');
        for(var j=0; j<allTomorrow.length; j++)
            allTomorrow[j].checked = result[1].DefaultSetting[i].Tomorrow;
    }
}

function DefaultChanged()
{
    var val = this.checked;
    var className = '.' + this.className.split(' ')[1];
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
            "Default": [],
            "Type": "",
            "Period": {},
            "OneDay": {},
            "Query": {}
        }
    }
    do{
        if(document.getElementById('query').style.display == 'block')
        {
            if(document.getElementById('query_start_date').value == '' ||
                document.getElementById('query_end_date').value == '')
            {
                alert('請填入日期');
                return;
            }
            content.data.Type = "Query";
            content.data.Query = {
                "StartDate": document.getElementById('query_start_date').value,
                "EndDate": document.getElementById('query_end_date').value
            }
            break;
        }
        for(var i=1; i<=5; i++)
        {
            content.data.Default[content.data.Default.length] = {
                "Noon": document.getElementById('default_' + i + '_noon').checked,
                "Night": document.getElementById('default_' + i + '_night').checked,
                "Tomorrow": document.getElementById('default_' + i + '_tomorrow').checked
            };
        }
        if(document.getElementById('daily').style.display == 'block')
        {
            if(document.getElementById('daily_date').value == '')
            {
                alert('請填入日期');
                return;
            }
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
            if(document.getElementById('period_start_date').value == '' ||
                document.getElementById('period_end_date').value == '')
            {
                alert('請填入日期');
                return;
            }
            content.data.Type = "Period";
            content.data.Period = {
                "StartDate": document.getElementById('period_start_date').value,
                "EndDate": document.getElementById('period_end_date').value,
                "Weekly": []
            }
            for(var i=1; i<=5; i++)
            {
                content.data.Period.Weekly[content.data.Period.Weekly.length] = {
                    "Noon": document.getElementById('period_' + i + '_noon').checked,
                    "Night": document.getElementById('period_' + i + '_night').checked,
                    "Tomorrow": document.getElementById('period_' + i + '_tomorrow').checked
                };
            }
        }
        else
            content.data.Type = "Default";
    }while(0);

    var result = await fetchPost(serverUrl + '/api', content, "application/json");
    if(result[0] == 200)
    {
        if(content.data.Type != "Query")
            document.location.href="./done.html";
        else
            showQueriedData(result[1]);
    }
}

function showQueriedData(data)
{
    var table = document.getElementById('query_table');
    table.innerHTML = '';
    var thead = document.createElement('thead');
    for(var i=0; i<data.Header.length; i++)
    {
        var th = document.createElement('th');
        th.innerHTML = data.Header[i];
        thead.appendChild(th);
    }
    table.appendChild(thead);
    for(var i=0; i<data.QueriedData.length; i++)
    {
        const row = table.insertRow(-1);
        for(var j=0; j<data.QueriedData[i].length; j++)
        {
            var cell = row.insertCell(-1);
            if(data.String && data.String[j] == true)
                cell.innerHTML = data.QueriedData[i][j];
            else
                cell.innerHTML = data.QueriedData[i][j] == true ? 'O' : 'X';
        }
    }
}

function checked_change()
{
    const type = this.id.split('_')[0];
    const allTabs = document.querySelectorAll('.ctab');
    for(var i=0; i<allTabs.length; i++)
        allTabs[i].style.display = 'none';
    const obj = document.getElementById(type);
    if(obj != null)
        obj.style.display = 'block';
}