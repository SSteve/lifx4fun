lifx4fun
========

Some JavaScript to control my four LIFX bulbs. If you don't have four bulbs, change `bulbCount` to the number of bulbs you have.

This uses the **lifxjs** library at [github.com/magicmonkey/lifxjs](https://github.com/magicmonkey/lifxjs) and is built off the demos there. To run lifx4fun, its folder needs to be a sibling folder to **lifxjs**.

I've never written JavaScript before so I'm sure I'm breaking lots of rules.

##Commands

- **1** Cycle slowly (and hopefully imperceptibly) around the color wheel
- **2** Cycle quickly around the color wheel
- **3** Alternate from red to green occasionally
- **4** Alternate from red to green quickly
	- *I got the bulbs just before Xmas. Modes 3 and 4 were to show off the LIFX bulbs to the family*
- **l** Toggle logging
- **r** Roll call: show current information for every bulb
- **s** Toggle saturation between full and half
- **ctrl-c** Turn off bulbs and exit program