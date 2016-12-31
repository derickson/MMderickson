##MMderickson

![Mirror](https://raw.githubusercontent.com/derickson/MMderickson/master/mirror.jpg)

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
		{
		   	module: 'derickson/cabi',
		   	position: 'top_left',
		   	header: "Capital Bikeshare (DC)",
		   	config: {
		   		stationName: '1st & M St NE'
		   	}
	    },
	    {
		   	module: 'derickson/wmata',
		   	position: 'top_left',
		   	header: "DC Metro",
		   	config: {
		   		stationCode: "B35",
		   		apiKey: "XXXXXXX"
		   	}
	    }
}
```

Oh and you'll need the ES template now

```
PUT _template/metric_temp
{
    "order": 0,
    "template": "metric-*",
    "settings": {
      "index": {
        "number_of_shards": "1",
        "number_of_replicas": "0"
      }
    },
    "mappings": {
      "_default_": {
        "dynamic_templates": [
          {
            "string_fields": {
              "mapping": {
                "index": "not_analyzed",
                "omit_norms": true,
                "type": "string",
                "doc_values": true
              },
              "match_mapping_type": "string",
              "match": "*"
            }
          }
        ]
      },
      "metric": {
        "_all": {
          "enabled": true
        },
        "properties": {
          "@timestamp": {
            "format": "strict_date_optional_time||epoch_millis",
            "type": "date"
          },
          "location": {
            "type": "geo_point"
          },
          "uber2": {
            "properties": {
              "uberTime": { "type": "float"},
              "uberSurge": { "type": "float"}
            }
          }
        }
      }
    },
    "aliases": {}
  }
```

