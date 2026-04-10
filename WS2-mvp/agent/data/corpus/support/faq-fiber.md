---
source: public domain knowledge
scraped: 2026-04-10
type: support
---

# JioFiber - Technical FAQ

## Installation

### Q1: How does JioFiber installation work?
After you request a connection on jio.com or MyJio, a Jio engineer visits your premises. They install a fiber cable from the nearest distribution point to your home, mount the ONT (Optical Network Terminal) device, connect it to the router, and activate the service. Installation typically takes 1-3 hours.

### Q2: How long does it take to get JioFiber installed after booking?
In metro areas with existing fiber infrastructure, installation is typically completed within 3-7 working days. In newer areas, it may take up to 15 days depending on fiber availability and building permissions.

### Q3: Is there an installation charge?
Standard installation is free for most plans. The Rs 2,500 refundable security deposit covers the ONT device. In some cases, if extended fiber laying is needed (e.g., independent houses far from the distribution point), additional charges may apply. The engineer will inform you before proceeding.

### Q4: Can JioFiber be installed in a rented apartment?
Yes. You need the landlord's permission for fiber cable routing into the apartment. The tenant can hold the connection in their own name with their own KYC documents.

### Q5: What if my building society does not allow JioFiber installation?
Jio has tie-ups with many housing societies. If your society has not approved Jio infrastructure, you can request your RWA to contact Jio's enterprise team. Alternatively, ask the Jio team to present their infrastructure plan to the society management.

### Q6: Is JioFiber FTTH or FTTB?
JioFiber primarily uses FTTH (Fiber to the Home), where a dedicated fiber cable runs from the distribution point directly to your apartment. In some multi-dwelling units, FTTB (Fiber to the Building) is used with fiber reaching the building's distribution box and Ethernet or short-run fiber to individual units. FTTH provides better performance and reliability.

## Router and Equipment

### Q7: What router does JioFiber provide?
JioFiber currently provides the JioFiber Gateway (also called JioFiber ONT). Models include the Nokia/Alcatel-Lucent ONT and Jio-branded routers. The device functions as a combined ONT + Wi-Fi router with dual-band support, Gigabit Ethernet ports, and a built-in VoIP adapter for landline service.

### Q8: Does the JioFiber router support dual-band Wi-Fi?
Yes. The JioFiber router supports both 2.4 GHz and 5 GHz bands. The 2.4 GHz band provides better range but lower speeds. The 5 GHz band provides faster speeds but shorter range. Both bands are enabled by default.

### Q9: How do I access my JioFiber router settings?
Open a browser and go to 192.168.29.1. Log in with the default credentials (usually admin/Jiocentrum or as printed on the router sticker). From the admin panel, you can configure Wi-Fi names, passwords, security settings, DHCP, and more.

### Q10: Can I change my Wi-Fi name and password?
Yes. Log in to the router admin panel at 192.168.29.1. Go to WiFi Settings. You can change the SSID (network name) and password for both 2.4 GHz and 5 GHz bands separately. Use WPA2 or WPA3 security for best protection.

### Q11: Does the JioFiber router support WPA3?
Newer JioFiber router models support WPA3. Older models support WPA2. You can check and change the security mode in the router admin panel under WiFi Settings > Security.

### Q12: How many Ethernet ports does the JioFiber router have?
The JioFiber Gateway typically has 4 Gigabit Ethernet LAN ports and 1 WAN port (used by the fiber connection). You can connect PCs, gaming consoles, smart TVs, or other devices via Ethernet for the best speed and reliability.

### Q13: Can I use my own third-party router with JioFiber?
Yes. Connect your router's WAN port to one of the LAN ports on the JioFiber ONT using an Ethernet cable. You can then disable Wi-Fi on the Jio router if you prefer to use your own router's Wi-Fi. The Jio ONT must remain powered on as it terminates the fiber connection.

### Q14: Does JioFiber support mesh Wi-Fi systems?
Yes. You can connect any mesh system (Google Nest WiFi, TP-Link Deco, Netgear Orbi, etc.) to the JioFiber ONT. Connect the mesh base unit to a LAN port on the JioFiber router. Optionally disable the Jio router's Wi-Fi to avoid interference.

## Speed and Performance

### Q15: What speeds can I expect on JioFiber?
Advertised speeds range from 30 Mbps to 1 Gbps depending on your plan. Actual speeds over Wi-Fi will be lower than wired speeds due to wireless overhead. On a wired Ethernet connection, you should get close to your plan speed. Factors like router placement, wall materials, distance, and device capability affect Wi-Fi speeds.

### Q16: Why is my JioFiber speed lower than the plan speed?
Common reasons include: testing over Wi-Fi instead of Ethernet, distance from the router, interference from other devices or neighboring Wi-Fi networks, older device with limited Wi-Fi capability, congestion during peak hours, or VPN usage. Test with a wired connection first to isolate the issue.

### Q17: What is JioFiber's fair usage policy (FUP)?
Most current JioFiber plans offer unlimited data without a hard FUP cap. However, Jio reserves the right to apply traffic management during extreme congestion. Older or lower-tier plans may have FUP limits after which speeds are reduced.

### Q18: Does JioFiber support Gigabit speeds on Wi-Fi?
Achieving true Gigabit over Wi-Fi requires a Wi-Fi 6 (802.11ax) or Wi-Fi 6E compatible router and client device. The standard JioFiber router supports Wi-Fi 5 (802.11ac), which can deliver up to approximately 300-600 Mbps in real-world conditions. For full Gigabit, use a wired Ethernet connection or upgrade to a Wi-Fi 6 router.

### Q19: What is the typical latency (ping) on JioFiber?
JioFiber typically provides latency of 2-10 ms to Indian servers and 50-150 ms to international servers. This makes it suitable for online gaming, video calls, and real-time applications.

## Advanced Settings

### Q20: Can I set up port forwarding on JioFiber?
Yes. Log in to the router admin panel at 192.168.29.1. Navigate to Advanced Settings > Port Forwarding. You can map external ports to internal device IP addresses. This is useful for gaming servers, IP cameras, or remote access.

### Q21: Does JioFiber offer a static IP address?
Static IP is available as an add-on for business users or on request for home users. Contact Jio support at 1800-889-9999 to enquire about static IP availability and charges for your connection.

### Q22: Can I enable bridge mode on the JioFiber router?
Some JioFiber router models support bridge mode, which passes the public IP directly to your connected router. This is useful if you want full control via your own router. Availability depends on your router model and firmware. Contact Jio support for assistance enabling this feature.

### Q23: Does JioFiber support UPnP?
Yes. UPnP (Universal Plug and Play) is typically enabled by default on the JioFiber router. This allows devices on your network to automatically configure port mappings. You can disable it from the router admin panel under Advanced Settings if you prefer manual control.

### Q24: Can I set up a guest Wi-Fi network?
Yes. The JioFiber router supports a guest network. Log in to the admin panel at 192.168.29.1, go to WiFi Settings > Guest Network. You can set a separate SSID and password for guests, isolating them from your main network.

### Q25: Does JioFiber support IPTV or multicast?
JioFiber supports Jio's own IPTV services through the Jio Set-Top Box. IGMP snooping and multicast are supported on the network for Jio's content delivery. Custom multicast configurations for third-party services are not officially supported.

### Q26: How do I check which devices are connected to my JioFiber network?
Log in to the router admin panel at 192.168.29.1. Navigate to Connected Devices or DHCP Client List. You will see the name, IP address, and MAC address of all connected devices. You can block unwanted devices from this interface.

### Q27: Can I set up parental controls on JioFiber?
Yes. The JioFiber router supports basic parental controls. Log in to the admin panel and go to Security > Parental Controls. You can block specific websites, set time-based access schedules, and filter content for specific devices.

### Q28: What is the default DNS used by JioFiber?
JioFiber uses Jio's own DNS servers by default. You can change the DNS to Google (8.8.8.8, 8.8.4.4), Cloudflare (1.1.1.1), or any other DNS provider in the router settings under Network > WAN > DNS, or on individual devices.
