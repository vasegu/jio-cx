---
source: generated from Indian broadband community patterns
scraped: 2026-04-10
type: community
---

# Common Issues and Fixes - Jio Home / JioFiber

Top 20 issues with customer reporting patterns, root causes, resolution steps, and escalation criteria.

---

## 1. Slow WiFi Speed (Plan Speed Not Achieved)

**How customers report it:**
- "WiFi speed bahut slow hai, plan 100 Mbps ka hai but 20 bhi nahi aa raha"
- "Speed dropped suddenly since last week"
- "Speedtest pe half speed aa rahi hai"

**Root Cause:**
WiFi interference, device connected to 2.4GHz instead of 5GHz, router placement, too many connected devices, or channel congestion in dense residential areas.

**Resolution Steps:**
1. Ask customer to run speed test on Ookla (not Jio app) - note both WiFi and wired results
2. If wired speed is close to plan speed, issue is WiFi - advise switching to 5GHz band
3. Check number of connected devices (more than 10 can degrade performance)
4. Advise moving router to central location, away from walls and other electronics
5. Guide customer to change WiFi channel via router admin panel (192.168.29.1)
6. If wired speed is also low, check for FUP exhaustion in account details
7. Run line diagnostics from backend

**When to Escalate:**
- Wired speed consistently below 50% of plan speed
- Line diagnostics show SNR issues or high packet loss
- Issue persists for more than 48 hours after basic troubleshooting

---

## 2. Complete Internet Outage (No Connection)

**How customers report it:**
- "Internet bilkul nahi chal raha, 2 din se band hai"
- "ONT pe red light aa rahi hai"
- "WiFi connected hai but internet nahi hai"

**Root Cause:**
Fiber cut in area, ONT hardware failure, OLT port issue, account suspension due to non-payment, or backend provisioning error.

**Resolution Steps:**
1. Check account status - is it active? Any pending payments?
2. Ask customer about ONT lights: PON light (should be solid green), LOS light (should be off)
3. If LOS light is red/blinking = fiber link down. Check area outage dashboard
4. If area outage exists, inform customer of estimated restoration time
5. If no area outage, guide power cycle: unplug ONT for 60 seconds, replug
6. If PON is green but no internet: check PPPoE session, try re-authentication from backend
7. If WiFi connected but no internet: could be DNS issue - guide customer to change DNS to 8.8.8.8

**When to Escalate:**
- LOS red light with no area outage logged (possible individual fiber cut)
- ONT completely dead (no lights at all) after power cycle - needs hardware replacement
- Backend re-authentication fails repeatedly
- Outage exceeds 24 hours without area-level acknowledgment

---

## 3. Router Overheating and Auto-Restart

**How customers report it:**
- "Router bahut garam ho jaata hai aur khud restart hota hai"
- "Router touch karo toh jal jaata hai haath"
- "Internet har 2-3 ghante pe disconnect hota hai, router restart ho jaata hai"

**Root Cause:**
Poor ventilation around router, dust accumulation, defective hardware, or power supply fluctuation.

**Resolution Steps:**
1. Ask customer about router placement - is it in an enclosed cabinet or on a shelf?
2. Advise placing router in open, ventilated area away from direct sunlight
3. Check if UPS/stabilizer is being used (voltage fluctuations cause overheating)
4. Guide customer to check if router firmware is updated (192.168.29.1 > Settings)
5. If router is more than 18 months old and overheating persists, likely hardware degradation
6. Arrange router replacement if under warranty

**When to Escalate:**
- Router replacement needed (hardware team)
- Overheating causes burn marks or melting on device
- Multiple customers in same area reporting similar issues (batch defect)

---

## 4. WiFi Range Issues

**How customers report it:**
- "Bedroom mein WiFi nahi aata, router living room mein hai"
- "Signal strength bahut weak hai 2 rooms door"
- "5GHz ka range toh bahut hi kum hai"

**Root Cause:**
Standard router has limited range (especially 5GHz). Thick walls (common in Indian construction), metal doors, and large apartments reduce signal.

**Resolution Steps:**
1. Confirm apartment/house size and router location
2. If single-room coverage issue: recommend repositioning router to central location
3. For multi-room: recommend Jio WiFi Mesh or third-party mesh system
4. Guide to use 2.4GHz for distant rooms (better range, lower speed) and 5GHz for near rooms
5. Check if band steering is enabled - if causing issues, advise splitting SSIDs
6. For large homes (2000+ sq ft), a single router is typically insufficient

**When to Escalate:**
- Customer requests mesh system installation (sales + technician visit)
- Router hardware may be defective if range is poor even in same room

---

## 5. Billing Overcharge

**How customers report it:**
- "Bill mein extra charges aa rahe hain, plan 999 ka hai but 1499 ka bill aaya"
- "Koi premium service activate nahi ki maine, ye charges kya hain?"
- "Double charge ho gaya hai"

**Root Cause:**
Inadvertent plan upgrade via IVR/app, add-on services auto-activated, pro-rated charges from mid-cycle change, or system glitch causing duplicate billing.

**Resolution Steps:**
1. Pull up customer's billing history for last 3 months
2. Compare current bill line items against plan details
3. Check for any add-on subscriptions (static IP, extra security, premium OTT)
4. Check for mid-cycle plan changes that may have pro-rated charges
5. If overcharge confirmed: initiate reversal/credit note
6. If double charge: verify with payment gateway, initiate refund
7. Inform customer of refund timeline (7-10 business days to bank account)

**When to Escalate:**
- Refund amount exceeds agent authorization limit
- System shows correct charge but customer has proof of different plan
- Recurring billing errors month over month (system bug)

---

## 6. OTT Apps Not Activating

**How customers report it:**
- "Netflix plan mein included hai but activate nahi ho raha"
- "OTT apps ka access kaise milega? MyJio mein option nahi hai"
- "Pehle Netflix chal raha tha ab suddenly band ho gaya"

**Root Cause:**
OTT activation requires linking through MyJio/JioTV app. Plan change may have removed OTT entitlements. Backend sync delay between Jio and OTT partner.

**Resolution Steps:**
1. Verify customer's current plan includes OTT entitlements
2. Guide to activate through MyJio app > JioFiber section > OTT apps
3. If activation fails: check if customer has existing personal subscription (conflicts)
4. Clear MyJio app cache and retry
5. If plan was recently changed: OTT re-linking may take 24-48 hours
6. For Netflix specifically: must log in through jiofiber.com/netflix, not Netflix app directly
7. Trigger backend OTT entitlement sync if available

**When to Escalate:**
- Backend sync fails after 48 hours
- Customer's plan clearly includes OTT but partner system rejects entitlement
- Mass OTT activation failure (partner-side outage)

---

## 7. Frequent Disconnections

**How customers report it:**
- "Internet din mein 10-15 baar disconnect hota hai"
- "Har aadhe ghante mein connection drop hota hai"
- "Online meeting ke beech mein net chala jaata hai"

**Root Cause:**
Loose fiber connector at ONT or wall socket, micro-bends in fiber cable, OLT port flapping, thermal issues causing intermittent link loss, or faulty patch cord.

**Resolution Steps:**
1. Check ONT logs for LOS events (indicates physical layer issue)
2. Ask customer to check if fiber cable has any sharp bends or is pinched
3. Guide to ensure all cable connections are firmly seated (click sound at ONT)
4. Check if disconnections correlate with specific times (thermal) or activities (load-based)
5. Run backend diagnostics for optical power levels - should be between -8 to -25 dBm
6. If optical power is marginal (-23 to -25 dBm), schedule technician visit for cable inspection

**When to Escalate:**
- Optical power levels out of acceptable range
- LOS events logged at ONT with no area-level fiber cut
- Issue persists after technician visit and cable re-termination
- Pattern of disconnections affecting multiple users on same OLT

---

## 8. Installation Delay

**How customers report it:**
- "3 hafte ho gaye connection apply kiye, koi nahi aaya"
- "Appointment tha aaj, technician nahi aaya"
- "Feasibility check mein atka hua hai"

**Root Cause:**
Pending feasibility in unserved micro-areas, fiber laying permissions from RWA/society, technician shortage, or order stuck in backend queue.

**Resolution Steps:**
1. Check order status in provisioning system
2. If feasibility pending: check if area fiber laying is planned (provide timeline if available)
3. If feasibility cleared but installation pending: check technician assignment
4. If technician assigned but not visited: contact local installation team lead
5. Provide customer with realistic timeline - don't over-promise
6. If order stuck more than 15 days, flag for priority assignment

**When to Escalate:**
- Order stuck in feasibility for more than 10 days
- Technician no-show after 2 appointments
- Customer threatening social media escalation or TRAI complaint
- Society/RWA permission issues blocking installation

---

## 9. Auto-Pay Issues

**How customers report it:**
- "Auto-pay se paisa kat gaya but account pending dikha raha hai"
- "Auto-pay band karna hai but option nahi mil raha"
- "Galat amount deduct hua hai auto-pay se"

**Root Cause:**
Payment gateway reconciliation delay, mandate active after cancellation, plan change not reflected in mandate amount.

**Resolution Steps:**
1. Verify payment deduction with transaction ID from bank/UPI
2. Check Jio billing system for payment receipt
3. If deducted but not credited: payment stuck in reconciliation - typically resolves in 24-48 hours
4. To cancel auto-pay: Guide through MyJio app > My Plans > Auto-pay > Manage
5. Also advise customer to revoke mandate from their bank/UPI app side
6. For wrong amount: check if plan was changed after mandate was set up

**When to Escalate:**
- Payment deducted but not reflected after 72 hours
- Customer unable to cancel mandate from any channel
- Recurring incorrect deductions

---

## 10. DNS Resolution Failures

**How customers report it:**
- "Some websites nahi khul rahe, baaki sab theek hai"
- "Google chalata hai but kuch sites pe 'site not found' aata hai"
- "WiFi connected hai, signal bhi hai, but websites load nahi ho rahe"

**Root Cause:**
Jio's default DNS servers experiencing issues, or specific domains blocked/misconfigured at ISP DNS level.

**Resolution Steps:**
1. Verify issue by asking customer to try multiple websites/apps
2. Guide customer to change DNS on device or router to Google DNS (8.8.8.8, 8.8.4.4) or Cloudflare (1.1.1.1)
3. On router: 192.168.29.1 > Network Settings > DNS > Manual > enter alternate DNS
4. On Windows: Network settings > IPv4 > DNS > Manual
5. On phone: WiFi settings > Modify network > Advanced > DNS
6. Flush DNS cache: ipconfig /flushdns (Windows) or restart browser

**When to Escalate:**
- Widespread DNS failures affecting multiple customers (infra team)
- Specific domains consistently failing even with alternate DNS (possible IP-level blocking)

---

## 11. Connection Transfer / Shifting

**How customers report it:**
- "Ghar shift ho raha hoon, connection transfer karna hai"
- "New address pe same connection shift hoga kya?"
- "Shifting ke liye kya process hai?"

**Root Cause:**
JioFiber connections are address-specific. Transfer depends on feasibility at new address.

**Resolution Steps:**
1. Check feasibility at new address first
2. If feasible: Raise shifting request - typical timeline is 7-10 days
3. Inform customer: same plan and number can be retained if new area is serviceable
4. If not feasible: Only option is to cancel old connection and apply fresh when area becomes serviceable
5. Security deposit carries over in case of transfer
6. Advise customer to not disconnect ONT until technician visits for de-installation

**When to Escalate:**
- New address feasibility unclear / conflicting info
- Customer wants expedited transfer due to work requirements
- Security deposit discrepancy between old and new connection

---

## 12. Set-Top Box / JioTV Issues

**How customers report it:**
- "Set-top box kaam nahi kar raha, screen black hai"
- "JioTV app bahut hang karta hai set-top box pe"
- "Remote control kaam nahi kar raha"
- "TV pe channels nahi aa rahe, error dikha raha hai"

**Root Cause:**
STB firmware issue, HDMI connectivity problem, remote battery/pairing issue, or STB not linked to active plan.

**Resolution Steps:**
1. Check HDMI connection - try different HDMI port on TV
2. Power cycle STB: unplug for 30 seconds
3. For remote issues: replace batteries, re-pair remote (hold Home + Back for 5 seconds)
4. Check if STB is linked to active plan with TV entitlement
5. If screen shows error code: look up specific error in knowledge base
6. For app crashes: clear cache in STB settings > Apps > JioTV > Clear cache
7. Factory reset as last resort: Settings > System > Reset

**When to Escalate:**
- STB hardware failure (no power, no display after all troubleshooting)
- Persistent error codes not in knowledge base
- Remote re-pairing fails (replacement needed)

---

## 13. Security Deposit Refund After Cancellation

**How customers report it:**
- "Connection cancel kiya 2 months pehle, deposit wapas nahi mila"
- "2500 ka deposit refund kab aayega?"
- "Har baar call karta hoon, bolte hain 7-10 working days, already 2 months ho gaye"

**Root Cause:**
Refund process requires equipment return verification, account closure confirmation, and finance team processing. Delays common due to equipment pickup backlog.

**Resolution Steps:**
1. Verify equipment (ONT, STB, remote) has been returned and acknowledged in system
2. If equipment not returned: arrange pickup or guide customer to nearest Jio store
3. If equipment returned but refund pending: check refund request status in finance queue
4. Verify customer's bank details on file for NEFT refund
5. Standard timeline: 15-30 business days after equipment return
6. If beyond 30 days: flag for finance team priority processing

**When to Escalate:**
- Refund pending beyond 45 days after equipment return
- Equipment return logged but system shows not received
- Customer has proof of return but system is not updated

---

## 14. Plan Auto-Renewal to Wrong Plan

**How customers report it:**
- "Bina bataye costlier plan pe auto-renew ho gaya"
- "Purana plan select kiya tha but alag plan activate ho gaya"
- "Plan expired hone pe automatically mehenga plan lag gaya"

**Root Cause:**
Customer's previous plan discontinued, system defaults to next available tier. Or promotional plan expired and reverted to standard pricing.

**Resolution Steps:**
1. Check plan history and identify when and why the change occurred
2. If previous plan was promotional: explain that promo period ended and standard pricing applies
3. If plan was discontinued: show available current plans at similar price point
4. If customer was not notified: acknowledge the gap and check for applicable plans
5. Can downgrade effective next billing cycle
6. For mid-cycle change to lower plan: pro-rated credit may apply depending on policy

**When to Escalate:**
- Customer claims no notification was sent and wants compensation
- System error caused wrong plan assignment
- Customer demands specific discontinued plan be reactivated

---

## 15. High Latency / Ping Issues (Gaming/Video Calls)

**How customers report it:**
- "Online gaming mein bahut lag aata hai, ping 150+ hai"
- "Video calls pe bahut delay hai, lag se meeting impossible hai"
- "Ping spikes ho rahe hain randomly"

**Root Cause:**
Network congestion at local node, routing issues, WiFi interference causing jitter, or customer using 2.4GHz band which has higher latency.

**Resolution Steps:**
1. Ask customer to run ping test to 8.8.8.8 and share results
2. Normal latency: under 20ms. Acceptable: under 50ms. Problematic: over 100ms
3. If on WiFi: strongly recommend wired Ethernet connection for gaming/calls
4. If wireless only: ensure 5GHz band is used, QoS enabled for gaming/video
5. Check for background downloads on other devices consuming bandwidth
6. Run backend diagnostics for node-level congestion
7. If routing issue: traceroute analysis to identify bottleneck

**When to Escalate:**
- Consistent latency over 100ms on wired connection
- Packet loss exceeding 2% on ping test
- Traceroute shows issue at Jio backbone level

---

## 16. Unable to Access Router Admin Panel

**How customers report it:**
- "192.168.29.1 khul nahi raha hai"
- "Router settings mein login nahi ho pa raha"
- "Admin password bhool gaya, kaise reset karu?"

**Root Cause:**
Customer not connected to router's network, browser cache issue, router in bridge mode, or admin credentials changed and forgotten.

**Resolution Steps:**
1. Ensure customer is connected to JioFiber WiFi (not mobile data)
2. Try in incognito/private browser window
3. Try alternate URL: 192.168.29.1 or jiofiber.local.html
4. Default credentials: admin/Jiocentrum (or check sticker on router bottom)
5. If credentials changed and forgotten: factory reset router (hold reset button 10 seconds)
6. Note: Factory reset will erase all custom settings including WiFi password
7. If in bridge mode: admin panel may not be accessible via WiFi

**When to Escalate:**
- Router admin panel inaccessible even after factory reset (hardware issue)
- Customer using bridge mode needs configuration help (technician visit)

---

## 17. Fiber Cable Damage

**How customers report it:**
- "Fiber cable kat gayi hai construction ke wajah se"
- "Baarish ke baad se cable damage ho gayi lagti hai"
- "Kisi ne cable tod di hai, internet band hai"

**Root Cause:**
Physical damage to fiber optic cable - construction activity, rodent damage, weather exposure, or accidental cuts.

**Resolution Steps:**
1. Verify LOS light is red on ONT (confirms physical layer break)
2. Ask customer to visually inspect cable from ONT to wall entry point for visible damage
3. If damage visible inside home: may be a quick splice job
4. If damage between home and distribution point: requires fiber team
5. Raise fiber repair request with exact location details
6. Provide estimated timeline based on damage type (in-home: 24-48h, outdoor: 48-72h)

**When to Escalate:**
- Outdoor cable damage affecting multiple customers (fiber maintenance team)
- Cable damaged in inaccessible location (underground, shared duct)
- Repeated cable damage at same location (needs permanent re-routing)

---

## 18. Port Forwarding / Static IP Issues

**How customers report it:**
- "Port forwarding karna hai gaming server ke liye"
- "Static IP chahiye, kaise milega?"
- "CCTV ka remote access nahi ho pa raha, port forward nahi ho raha"
- "WFH ke liye VPN connect nahi ho raha"

**Root Cause:**
JioFiber uses CGNAT by default (shared public IP). Port forwarding requires static IP add-on. Some VPNs struggle behind CGNAT.

**Resolution Steps:**
1. Explain CGNAT: multiple customers share one public IP, so direct port forwarding is not possible
2. For port forwarding: customer needs Static IP add-on (Rs 500/month or as per current pricing)
3. Guide to request static IP through MyJio app or customer care
4. Once static IP assigned: port forwarding can be configured in router admin panel
5. For VPN issues: most modern VPNs work behind CGNAT. Check if specific VPN ports are blocked
6. Alternative for remote access: suggest using Cloudflare tunnels or similar service as workaround

**When to Escalate:**
- Static IP provisioning fails or takes more than 48 hours
- Corporate VPN requirements that CGNAT breaks (may need enterprise plan)

---

## 19. Account Login / MyJio App Issues

**How customers report it:**
- "MyJio app mein login nahi ho pa raha"
- "OTP nahi aa raha login ke liye"
- "Account mein kisi aur ka number linked hai"
- "App crash ho raha hai baar baar"

**Root Cause:**
App version outdated, OTP delivery failure, wrong mobile number linked to JioFiber account, or app cache corruption.

**Resolution Steps:**
1. Ensure MyJio app is updated to latest version
2. Clear app cache and data, then retry login
3. Verify the registered mobile number for the JioFiber account
4. If OTP not received: check if number has DND enabled, try after 5 minutes
5. If wrong number linked: customer needs to visit Jio store with ID proof to update
6. For persistent app crashes: uninstall and reinstall
7. Alternative: try logging in via jio.com website

**When to Escalate:**
- Account locked due to multiple failed attempts
- Wrong number linked and customer cannot visit store (special process needed)
- Systematic OTP delivery failures

---

## 20. Noise / Crackling on JioFiber Landline (Voice)

**How customers report it:**
- "Landline pe awaaz nahi aa rahi properly"
- "Phone pe bahut noise aata hai, static crackling hai"
- "Incoming calls nahi aa rahe landline pe"
- "Call drop hota hai har 2-3 minute mein"

**Root Cause:**
VoIP quality depends on internet stability. Issues can stem from low bandwidth allocation for voice, ONT voice port issues, or overall connection instability.

**Resolution Steps:**
1. Check if internet is working properly - voice issues often accompany data issues
2. Power cycle the ONT (this resets the voice module too)
3. Check phone cable from ONT voice port to phone handset - try a different cable
4. Try a different phone handset to rule out handset issues
5. Check if QoS is enabled on router giving priority to voice traffic
6. From backend: verify VoIP provisioning and SIP registration status
7. If SIP registration failing: re-provision voice service

**When to Escalate:**
- SIP registration consistently failing (backend voice team)
- Voice port on ONT hardware faulty (replacement needed)
- One-way audio or echo issues persisting after all troubleshooting
