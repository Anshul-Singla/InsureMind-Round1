# InsureMind-Round1

cURl for POST api database :- 
--location 'http://localhost:8000/api/upload' \
--form 'file=@"postman-cloud:///1f00e17e-3a05-4e60-9021-184e9cb373b2"'


cURl for GET api to serach user policy info by username :- 
curl --location 'http://localhost:8000/api/policy/search?username=David%20Tombolato'



cURl for GET api for aggregate policy info :- 
curl --location 'http://localhost:8000/api/policy/'

cURl for POST api for shedule message :- 
curl --location 'http://localhost:8000/api/schedule' \
--header 'Content-Type: application/json' \
--data '{
  "message": "team",
  "day": "2025-04-01",
  "time": "02:56"
}'
