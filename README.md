# Stat Block Maker

A browser-based tool for building D&D 5e monster stat blocks. Fill in the form on the left and see a formatted stat block update in real time on the right. Print directly from the browser when you're done.

## Features

- All standard stat block fields: identity, defenses, ability scores, saving throws, skills, senses, speeds, damage immunities/resistances/vulnerabilities
- Structured attack entries (to-hit, reach/range, typed damage components) alongside free-text actions
- Bonus Actions, Reactions, Legendary Actions, Lair Actions, and Regional Effects
- XP and Proficiency Bonus derived automatically from Challenge Rating
- Passive Perception derived from Wisdom modifier or Perception skill bonus
- Verify button flags any missing required fields before printing
- Print mode previews ink-saving black-and-white output; the editor is hidden on actual print

## Requirements

- Node.js v18+
- npm

## Getting Started (Local Development)

```bash
git clone https://github.com/R3volv360/StatBlockMaker.git
cd StatBlockMaker
npm install
npm run dev
```

Open the local URL shown in the terminal. The Adult Red Dragon is pre-loaded as an example — use **Clear** to start fresh.

To expose on your local network (e.g. access from another device):

```bash
npm run dev -- --host
```

## Running as a Background Service (Debian/Ubuntu)

To run the app automatically on boot without staying in a terminal:

**1. Create the systemd service**

```bash
sudo nano /etc/systemd/system/statblockmaker.service
```

```ini
[Unit]
Description=StatBlockMaker
After=network.target

[Service]
Type=simple
User=YOUR_USERNAME
WorkingDirectory=/home/YOUR_USERNAME/StatBlockMaker
ExecStart=/usr/bin/npm run dev -- --host
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Replace `YOUR_USERNAME` with your Linux username and adjust `WorkingDirectory` to match your actual path.

**2. Enable and start the service**

```bash
sudo systemctl daemon-reload
sudo systemctl enable statblockmaker
sudo systemctl start statblockmaker
```

**3. Check status / logs**

```bash
sudo systemctl status statblockmaker
journalctl -u statblockmaker -f
```

The app will be available at `http://<your-server-ip>:5173/StatBlockMaker/`

To allow the port through your firewall:

```bash
sudo ufw allow 5173
```

## Tech

React 19, Vite. No external UI libraries. All styles are self-contained.
