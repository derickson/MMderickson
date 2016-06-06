##MMderickson

![Screenshot](https://raw.githubusercontent.com/derickson/MMderickson/master/screenshot.jpg)

to install, checkout this repo into your MagicMirror modules directory and rename the folder to ```derickson```

configs will then look something like this:
```
{
			module: 'derickson/wunderground',
			position: 'top_right',
			header: 'Current Weather (DC)',
			config: {
				appid: 'XXXXX',
				location: 'DC/Washington'
			}
		},
		{
			module: 'derickson/wundergroundForecast',
			position: 'top_right',
			header: 'Forecast (DC)',
			config: {
				appid: 'XXXXXXX',
				location: 'DC/Washington',
				maxNumberOfDays: 5
			}
		},
		{
			module: 'derickson/uber',
			position: 'bottom_right',
			header: 'Uber (DC)',
			config: {
				lat: XX.0,  // use your exact pickup loaction
				long: -XX.0, // use your exact pickup loaction
				product_id: 'dee8691c-8b48-4637-b048-300eee72d58d',
				client_id: 'XXXXXXX',
				uberServerToken: 'XXXXXXX'
			}
		},
```