--compressed code style due to transmission errors
--use this tool to transmmit: https://github.com/4refr0nt/luatool
pin=4;
gpio.mode(pin,gpio.INPUT);
gpio.write(pin,gpio.LOW);
clock=0;
t=30000;
lowpocc=0;
pocc=0;
s=gpio.read(pin);
srv=net.createServer(net.TCP)
 srv:listen(80,function(conn)
  conn:on("receive",function(conn,payload)
   print(payload);
   data = "{\"status\":\"success\","
   .."\"data\": {\"current\":"
   .. lowpocc
   .. "},\"message\": null}"
   conn:send("HTTP/1.1  200 OK\r\n"
    .."Content-Type: application/json\r\n"
    .."Content-Length: " .. data:len() .. "\r\n"
    .."Connection: close\r\n"
    .."\r\n"..data.."\r\n");
  end)
  conn:on("sent",function(conn)
  conn:close()
 end)
end)
tmr.alarm(0,1,1,function()
  clock=clock + 1;
  s=gpio.read(pin);
  pocc=pocc + s;
  if (clock > t) then
   lowpocc=pocc;
   print(lowpocc);
   pocc=0;
   clock=0;
  end 
end)