# 🐉 Stat Block Maker 📜

## https://r3volv360.github.io/StatBlockMaker/

A browser-based tool for building D&D 5e monster stat blocks. Fill in the form and see a formatted stat block update in real time. Print directly from the browser when you're done.

I asked a friend for a tool to create statblocks and they, in a way, said, "write your own".

## Features

- All standard 5e customisable stat block fields. E.g. name, size, alignment, ability scores, actions, reactions, etc
- Add a description to your creatures
- Structured attack entries (to-hit, reach/range, typed damage components) alongside free-text actions
- Input dice rolls for HP or use a flat entry
- Also use the structured dice entry for attacks' damage
- Verify button flags any missing required fields
- Print your stat block out for your games

## Deployment

For now, the website is built and deployed using GitHub Actions on each push to GitHub. It's hosted on GitHub Pages at https://r3volv360.github.io/StatBlockMaker/.

## Development

### Requirements

Node.js v22+ and npm: https://nodejs.org/en/download

### Getting Started

```bash
git clone https://github.com/R3volv360/StatBlockMaker.git
cd StatBlockMaker
npm install
npm run dev
```

Then open the local URL shown in the terminal. The Adult Red Dragon is pre-loaded as an example — use **Clear** to start fresh.

To expose on your local network (e.g. access from another device):

```bash
npm run dev -- --host
```

### Testing

```bash
npm test            # run once
npm run test:watch  # watch mode
```

### Running as a Background Service (Linux)

To run the app in development mode automatically on boot without staying in a terminal:

#### 1. Create the systemd service

Create the following file: `/etc/systemd/system/statblockmaker.service` and add the below to it.

Replace $USER with your username and $WORKING_DIRECTORY with the path you've cloned the repo into.

```ini
[Unit]
Description=StatBlockMaker
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$WORKING_DIRECTORY
ExecStart=/usr/bin/env npm run dev -- --host
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

#### 2. Enable and start the service

```bash
sudo systemctl daemon-reload
sudo systemctl enable statblockmaker
sudo systemctl start statblockmaker
```

The app will be available at `http://<your-server-ip>:5173/StatBlockMaker/`

#### 3. Check status / logs

```bash
sudo systemctl status statblockmaker
journalctl -u statblockmaker -f
```