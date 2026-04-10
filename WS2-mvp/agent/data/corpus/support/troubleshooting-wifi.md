---
source: public domain knowledge
scraped: 2026-04-10
type: support
---

# JioFiber Wi-Fi Troubleshooting Guide

## Issue 1: Slow Internet Speed

### Symptoms
- Web pages load slowly
- Downloads take longer than expected
- Speed test shows significantly lower speed than plan

### Step-by-Step Resolution

1. **Run a speed test on a wired connection.** Connect your laptop or PC directly to the JioFiber router using an Ethernet cable. Go to speedtest.net or fast.com and run a test. If wired speed matches your plan, the issue is Wi-Fi related, not a line issue.

2. **Check which Wi-Fi band you are connected to.** If your network shows both 2.4 GHz and 5 GHz, connect to the 5 GHz band for faster speeds when you are within 5-10 meters of the router.

3. **Restart the JioFiber router.** Unplug the power cable from the router, wait 30 seconds, and plug it back in. Wait 2-3 minutes for the router to fully boot and reconnect.

4. **Check for interference.** Move the router away from microwaves, cordless phones, Bluetooth devices, and other electronic equipment. Place the router in a central, elevated location - not inside a cabinet or behind furniture.

5. **Check connected devices.** Log in to 192.168.29.1 and check the connected devices list. Too many devices (15+) on Wi-Fi simultaneously can degrade performance. Disconnect devices you are not actively using.

6. **Change the Wi-Fi channel.** In the router admin panel, go to WiFi Settings > Advanced. For 2.4 GHz, try channels 1, 6, or 11. For 5 GHz, try channels 36, 40, 44, or 48. This avoids congestion from neighboring networks.

7. **Check for background downloads.** Ensure no device is running large downloads, Windows updates, cloud backups, or streaming on multiple screens simultaneously.

8. **Update your device's Wi-Fi drivers.** On a laptop, update the Wi-Fi adapter driver through Device Manager (Windows) or Software Update (Mac).

9. **Test at different times.** If speed is slow only during peak hours (8-11 PM), this may be network congestion. If it persists at all times, contact Jio support.

10. **Contact Jio support.** If wired speeds are also significantly below your plan, call 1800-889-9999 and request a line check. A technician can verify the fiber signal strength (optical power levels) at your ONT.

---

## Issue 2: No Internet Connection

### Symptoms
- Wi-Fi is connected but no internet access
- Browser shows "No Internet" or "DNS not found"
- All devices affected

### Step-by-Step Resolution

1. **Check the router lights.** Look at the JioFiber ONT device. The PON light should be solid green (fiber connected). The Internet/WAN light should be solid green (internet active). If PON is off or red, there may be a fiber break.

2. **Restart the router.** Unplug power, wait 30 seconds, plug back in. Wait 3 minutes for full boot. Check if the PON and Internet lights come back green.

3. **Check all cable connections.** Ensure the fiber cable going into the ONT is firmly connected and not bent sharply. Check that the Ethernet cable between the ONT and your device (if wired) is secure.

4. **Test with a different device.** Try connecting a different phone or laptop to confirm the issue is not device-specific.

5. **Check for service outage.** Open the MyJio app on mobile data and check for any outage notification. You can also check social media (@JioCare on Twitter) for reported outages in your area.

6. **Verify your plan has not expired.** Open MyJio app and check if your JioFiber plan is active. If it has expired, recharge to restore service.

7. **Try changing DNS.** On your device, manually set DNS to 8.8.8.8 (primary) and 8.8.4.4 (secondary). This rules out DNS resolution issues.

8. **Factory reset the router (last resort).** Press and hold the reset button on the back of the router for 10-15 seconds. The router will restart with factory settings. You will need to reconfigure Wi-Fi name and password. Note: Only do this if other steps fail.

9. **Check for fiber damage.** Visually inspect the fiber cable from the wall point to the ONT. Look for sharp bends, crimps, or damage. Do not attempt to repair fiber cable yourself.

10. **Contact Jio support.** Call 1800-889-9999. Report the PON light status, describe when the issue started, and request a technician visit. Reference your complaint number for follow-up.

---

## Issue 3: Intermittent Connection Drops

### Symptoms
- Internet works for a while then disconnects
- Wi-Fi signal drops and reconnects
- Video calls freeze or drop
- Online games lag or disconnect

### Step-by-Step Resolution

1. **Note the pattern.** Track when drops occur - specific times of day, when using specific devices, or randomly. This helps diagnose the cause.

2. **Check if the issue is Wi-Fi or internet.** When the connection drops, check if your device is still connected to Wi-Fi. If Wi-Fi disconnects, the issue is the router or interference. If Wi-Fi stays connected but internet drops, the issue is upstream.

3. **Restart the router.** Power cycle the ONT device. Wait 30 seconds before powering on. Allow 3 minutes for reconnection.

4. **Check the fiber cable.** A loose or slightly damaged fiber cable can cause intermittent drops. Ensure the cable is not under tension, sharply bent, or pinched by furniture.

5. **Separate 2.4 GHz and 5 GHz networks.** If both bands share the same SSID, your device may keep switching between them causing drops. In the router admin panel, set different names (e.g., "MyHome" and "MyHome-5G") for each band.

6. **Disable auto-channel selection.** In the router admin panel, set a fixed Wi-Fi channel instead of Auto. For 5 GHz, try channel 36 or 149. For 2.4 GHz, use 1, 6, or 11.

7. **Check for IP address conflicts.** If two devices have the same IP, it causes intermittent issues. In the router admin panel, check DHCP settings and ensure the IP range is sufficient for all your devices.

8. **Update router firmware.** Check if a firmware update is available in the router admin panel. Jio pushes updates periodically that fix stability issues.

9. **Monitor the PON light during a drop.** If the PON light blinks or goes off during drops, there is a fiber issue that needs a technician visit.

10. **Raise a complaint.** If drops happen daily, raise a complaint via MyJio app or call 1800-889-9999. Ask for optical signal level (ORL/ONT power) testing to check fiber quality.

---

## Issue 4: Specific Device Cannot Connect to Wi-Fi

### Symptoms
- One device cannot see or connect to the JioFiber network
- Device shows "Authentication error" or "Couldn't connect"
- Other devices work fine on the same network

### Step-by-Step Resolution

1. **Toggle Wi-Fi on the device.** Turn Wi-Fi off, wait 10 seconds, turn it back on. Let it scan for networks.

2. **Forget and reconnect.** On the device, go to Wi-Fi settings, tap on the JioFiber network, select "Forget" or "Remove." Then reconnect by selecting the network and entering the password again.

3. **Double-check the password.** Ensure you are entering the correct Wi-Fi password. Watch for uppercase/lowercase errors. The default password is on the router sticker if you have not changed it.

4. **Check if the device is blocked.** Log in to 192.168.29.1 and check the MAC filter or Access Control list. Ensure the device's MAC address is not blacklisted.

5. **Check maximum device limit.** The JioFiber router supports up to 32-64 simultaneous Wi-Fi connections depending on the model. If you have many smart home devices, you may be near the limit.

6. **Try the other Wi-Fi band.** If the device cannot connect to 5 GHz, try 2.4 GHz, or vice versa. Some older devices only support 2.4 GHz.

7. **Restart the device.** A full restart of the phone, laptop, or tablet often clears networking glitches.

8. **Reset network settings on the device.** On Android: Settings > System > Reset > Reset Wi-Fi, mobile & Bluetooth. On iPhone: Settings > General > Transfer or Reset > Reset Network Settings. Note: This will forget all saved Wi-Fi networks.

9. **Check for IP assignment issues.** On the device, set Wi-Fi to obtain IP automatically (DHCP). If it shows a 169.x.x.x address, the router is not assigning an IP - restart the router.

10. **Test with another network.** Connect the device to a mobile hotspot to confirm its Wi-Fi hardware is working. If it connects to other networks but not JioFiber, the issue is compatibility related.

---

## Issue 5: OTT Apps Buffering or Not Loading

### Symptoms
- Netflix, Hotstar, JioCinema, or other apps buffer constantly
- Video quality drops to low resolution
- App shows "connection error" or fails to load content

### Step-by-Step Resolution

1. **Check your internet speed.** Run a speed test at speedtest.net. For HD streaming you need at least 5 Mbps, for 4K you need 25 Mbps. If your speed is below these thresholds, resolve the speed issue first.

2. **Restart the streaming app.** Force close the app completely and reopen it. On smart TVs, exit the app and relaunch it.

3. **Restart the JioFiber router.** Power cycle the router - unplug, wait 30 seconds, plug back in. Wait 3 minutes and try streaming again.

4. **Connect to the 5 GHz Wi-Fi band.** Streaming devices should be on the 5 GHz band for better throughput. If your smart TV is far from the router and cannot get 5 GHz signal, consider using an Ethernet cable.

5. **Use a wired connection for your TV.** If your smart TV or streaming box has an Ethernet port, connect it directly to the JioFiber router with an Ethernet cable. This eliminates Wi-Fi as a variable.

6. **Lower the streaming quality.** In the app settings, manually set video quality to a lower resolution and see if buffering stops. If it does, your bandwidth may be insufficient for higher quality.

7. **Clear app cache and data.** On your device, go to Settings > Apps > [streaming app] > Clear Cache. If that does not help, clear data (you will need to sign in again).

8. **Check DNS settings.** Some DNS servers resolve streaming content faster. Try setting your device or router DNS to Google (8.8.8.8) or Cloudflare (1.1.1.1).

9. **Check for other bandwidth usage.** If someone else in the house is downloading large files, running backups, or streaming on another device, it can affect your stream. Pause other heavy usage temporarily.

10. **Verify your OTT subscription.** Some JioFiber plans include OTT at limited resolution. Ensure your plan tier includes the quality level you want. Check MyJio app for your included OTT benefits.

11. **Update the streaming app.** Ensure you are running the latest version of the app from the Play Store, App Store, or your smart TV's app store.

12. **Contact Jio support.** If the issue persists and your speed test is normal, the problem may be with Jio's peering to the OTT provider. Report the issue with specific details (which app, what time, what error) to 1800-889-9999.
