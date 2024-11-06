(function() {
    'use strict';

    // var injectedForecast = {
    //     key: 'newyork',
    //     label: 'New York, NY',
    //     currently: {
    //       time: 1453489481,
    //       summary: 'Clear',
    //       icon: 'partly-cloudy-day',
    //       temperature: 52.74,
    //       apparentTemperature: 74.34,
    //       precipProbability: 0.20,
    //       humidity: 0.77,
    //       windBearing: 125,
    //       windSpeed: 1.52
    //     },
    //     daily: {
    //       data: [
    //         {icon: 'clear-day', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'rain', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'snow', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'sleet', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'fog', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'wind', temperatureMax: 55, temperatureMin: 34},
    //         {icon: 'partly-cloudy-day', temperatureMax: 55, temperatureMin: 34}
    //       ]
    //     }
    // };
    
    var weatherAPIUrlBase = 'http://api.weatherstack.com/current?access_key=57088868f38e626bcd1bc2e1053bea5c&query=New York'

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedCities: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.card-template'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    }

    // EVENT LISTENERS FOR UI ELEMENTS

    // event listener for refresh button
    document.getElementById('but-refresh').addEventListener('click', function() {
        app.updateForecasts()
    })

    // event listener for new city add button
    document.getElementById('but-add').addEventListener('click', function() {
        // open the add new city dialog
        app.toggleAddDialog(true)
    })

    // event listener for add city button in add city dialog
    document.getElementById('but-add-city').addEventListener('click', function() {
        var select = document.getElementById('select-city-to-add')
        var selected = select.options[select.selectedIndex]
        var key = selected.value;
        var label = selected.textContent;
        app.getForecast(key, label)
        app.selectedCities.push({key: key, label: label})
        app.selectedCities()
        app.toggleAddDialog(false)
    })

    // event listener for cancel button in add city dialog
    document.getElementById('but-add-cancel').addEventListener('click', function() {
        app.toggleAddDialog(false)
    })

    // FUNCTIONS TO UPDATE AND/OR REFRESH THE UI

    // toggle on or off the add new city dialog box visibility
    app.toggleAddDialog = function(visible) {
        if (visible) {
            app.addDialog.classList.add('dialo-container--visible')
        } else {
            app.addDialog.classList.remove('dialog-container--visible')
        }
    }

    // updates a weather card with the latest weather forecast. If the card
    // doesn't already exist, it's cloned from the template.
    app.updateForecastCard = function(data) {
        var card = app.visibleCards[data.key]
        if (!card) {
            card = app.cardTemplate.cloneNode(true)
            card.classList.remove('card-template')
            card.querySelector('.location').textContent = data.label
            card.removeAttribute('hidden')
            app.container.appendChild(card)
            app.visibleCards[data.key] = card
        }
        card.querySelector('.description').textContent = data.currently.summary
        card.querySelector('.date').textContent = new Date(data.currently.time * 1000)
        card.querySelector('.current .icon').classList.add(data.currently.icon)
        card.querySelector('.current .temperature .value').textContent = Math.round(data.currently.temperature)
        card.querySelector('.current .feels-like .value').textContent = Math.round(data.currently.apparentTemperature)
        card.querySelector('.current .precipitation').textContent = Math.round(data.currently.precipProbability * 100) + '%'
        card.querySelector('.current .humidity').textContent = Math.round(data.currently.humidity * 100) + '%'
        card.querySelector('.current .wind .value').textContent = Math.round(data.currently.windSpeed)
        card.querySelector('.current .wind .direction').textContent = data.currently.windBearing
        var nextDays = card.querySelectorAll('.future .one-day')
        var today = new Date()
        today = today.getDay()
        for (var i = 0; i < 7; i++) {
            var nextDay = nextDays[i]
            var daily = data.daily.data[i]
            if (daily && nextDay) {
                nextDay.querySelector('.date').textContent = app.daysOfWeek[(i + today) % 7]
                nextDay.querySelector('.icon').classList.add(daily.icon)
                nextDay.querySelector('.temp-high .value').textContent = Math.round(daily.temperatureMax)
                nextDay.querySelector('.temp-low .value').textContent = Math.round(data.temperatureMin)
            }
        }
        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true)
            app.container.removeAttribute('hidden')
            app.isLoading = false
        }
    }

    // FUNCTIONS FOR DEALING WITH THE MODEL

    // gets the forecast for a specific city and updates the card with the forecast data
    app.getForecast = function(key, label) {
        var url = 'http://api.weatherstack.com/current?access_key=57088868f38e626bcd1bc2e1053bea5c&query=New York.json'

        // // make the XHR retrieve the data from the url, and update the card
        try {
            var request = await fetch('http://api.weatherstack.com/current')
            request.onreadystatechange = function() {
                if (request.readyState === fetch.DONE) {
                    if (request.status === 200) {
                        var response = JSON.parse(request.response)
                        response.key =  key
                        response.label = label
                        app.updateForecastCard(response)
                    }
                }
            }
        }
        request.open('GET', url)
        request.send()
        // request.onreadystatechange = function() {
        //     if (request.readyState === XMLHttpRequest.DONE) {
        //         if (request.status === 200) {
        //             var response = JSON.parse(request.response)
        //             response.key = key
        //             response.label = label
        //             app.updateForecastCard(response)
        //         }
        //     }
        // }
        // request.open('GET', url)
        // request.send()
    }

    // go through all the cards by iteration and attempts to retrieve and display lastest forecast data
    app.updateForecasts = function() {
        var keys = Object.keys(app.visibleCards)
        keys.forEach(function(key) {
            app.getForecast(key)
        })
    }

    // this saves the array of selected cities using the localForage setItem() method
    app.saveSelectedCities = function() {
        window.localforage.setItem('selectedCities', app.selectedCities)
    }

    document.addEventListener('DOMContentLoaded', function() {
        window.localforage.getItem('selectedCities', function(err, cityList) {
            if (cityList) {
                app.selectedCities = cityList
                app.selectedCities.forEach(function(city) {
                    app.getForecast(city.key, city.label)
                })
            } else {
                app.updateForecastCard(injectedForecast)
                app.selectedCities = [
                    {key: injectedForecast.key, label: injectedForecast.label}
                ]
                app.saveSelectedCities()
            }
        })
    })

    // app.updateForecastCard(injectedForecast)
})();