import React from 'react'

export function numberDateToString(dateTime) {
    dateTime = new Date(parseInt(dateTime));

    const date = ("0" + dateTime.getDate()).slice(-2);
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
    const year = dateTime.getFullYear();
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    const seconds = dateTime.getSeconds();

    return year + "/" + month + "/" + date + " " + hours + ":" + minutes + ":" + seconds;
}

export function setDefaultDateFrom(modifyDate) {
    let dateTime = new Date();

    if (modifyDate !== undefined) {
        dateTime.setDate(dateTime.getDate() + modifyDate);
    }

    const date = ("0" + (dateTime.getDate())).slice(-2);
    const month = ("0" + (dateTime.getMonth() + 1)).slice(-2);
    const year = dateTime.getFullYear();

    return year + "/" + month + "/" + date + " 00:00:00";
}

export function setDefaultDateTo() {
    return "2030/12/31 23:59:59";
}

export function createUuid() {
    function s4() {
        return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
    }

    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function showGridLoadingMsg() {
    const overlay = document.getElementsByClassName('ag-overlay')[0];
    overlay.classList.remove("ag-hidden");
    const wrapper = document.getElementsByClassName('ag-overlay-wrapper')[0];
    const msg = document.createElement("span");
    msg.setAttribute("class", "ag-overlay-loading-center");
    msg.innerText = 'Please wait while your rows are loading';
    wrapper.appendChild(msg);
}

export function hideGridLoadingMsg() {
    const overlay = document.getElementsByClassName('ag-overlay')[0];
    overlay.classList.add("ag-hidden");
    const msg = document.getElementsByClassName("ag-overlay-loading-center")[0];
    if (msg !== undefined) msg.parentNode.removeChild(msg);
}

export function showGridNoRowMsg() {
    const overlay = document.getElementsByClassName('ag-center-cols-viewport')[0];
    const msg = document.createElement("div");
    msg.style.position = 'absolute';
    msg.style.top = '50%';
    msg.style.left = '50%';
    msg.fontSize = '20px';
    msg.style.transform = 'translate(-50%,-50%)';

    msg.innerText = 'No rows were found';
    overlay.appendChild(msg);
}

export function requiredCheck(value) {
    const check = (value === null || value === undefined || value === '' || value.length === 0) ? true : false
    return check;
}

export function getParam(name) {
    if (window.location.search === "") {
        return null;
    } else {
        let curr_url = window.location.search.substr(window.location.search.indexOf("?") + 1);

        let svalue = "";
        curr_url = curr_url.split("&");
        for (let i = 0; i < curr_url.length; i++) {
            const temp = curr_url[i].split("=");
            if ([temp[0]] == name) {
                svalue = temp[1];
            }
        }
        return svalue;
    }
}