const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, Client } = require('discord.js');
const fs = require('node:fs');

//[建立/回覆 button] -> [建立 collector] -> [輸贏啦] -> [讀檔] -> [解析] -> [做事]  -> [回應] -> [存檔]

module.exports = {
    data: new SlashCommandBuilder().setName('janken').setDescription('Earn money with janken!'),
    async execute(client, interaction) {

        //建立 embed 和剪刀石頭布的三個 button
        const buttonEmbed = new EmbedBuilder().setTitle("Janken~~");

        const scissorButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonScissor')
        .setLabel('✌️');
        
        const rockButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonRock')
        .setLabel('✊');
        
        const paperButton = new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setCustomId('buttonPaper')
        .setLabel('✋');

        //將三個 button 都放入 row 中並回覆 embed 和 row
        const buttonRow = new ActionRowBuilder().addComponents(scissorButton,rockButton,paperButton);
        
        //回覆
        interaction.reply({ embeds: [buttonEmbed], components: [buttonRow] });

        //建立 collector
        const collector = interaction.channel.createMessageComponentCollector({ time: 15000 });

        //等待 collector 蒐集到玩家案的按鈕
        collector.on('collect', async collected => {

            //電腦隨機出拳 (0:剪刀 1:石頭 2:布)
            const botChoice = Math.floor(Math.random()*3);

            //利用玩家所按按鈕的 customId 來判斷玩家的選擇
            let playerChoice=collected.customId;

            //判斷玩家勝利，電腦勝利或平手 (0:平手 1:電腦 2:玩家)
            let winner = 0;
            if((playerChoice=='buttonScissor' && botChoice==0) || (playerChoice=='buttonRock' && botChoice==1) || (playerChoice=='buttonPaper' && botChoice==2))
            {
                winner=0;
            }
            else if((playerChoice=='buttonScissor' && botChoice==1) || (playerChoice=='buttonRock' && botChoice==2) || (playerChoice=='buttonPaper' && botChoice==0))
            {
                winner=1;
            }
            else if((playerChoice=='buttonScissor' && botChoice==2) || (playerChoice=='buttonRock' && botChoice==0) || (playerChoice=='buttonPaper' && botChoice==1))
            {
                winner=2;
            }

            //從結果計算獲得/失去的 money
            let earnings;
            if(winner==0)
            {
                earnings=0;
            }
            else if(winner==1)
            {
                earnings=-5;
            }
            else if(winner==2)
            {
                earnings=5;
            }

            //讀取 players.json 並 parse 成 players
            const data = fs.readFileSync('player.json');
            const players = JSON.parse(data);

            //在所有資料中尋找呼叫此指令玩家的資料
            let found = false;
            for (let i = 0; i < players.length; i++) {

                //如果有就修改該玩家的 money 並回覆結果
                if (players[i].id == interaction.user.id) {
                    found = true;
                    players[i].money += earnings;
                    const resultEmbed = new EmbedBuilder().setTitle('Result:')
                    .setColor('Blue');
                    if(winner==0)
                    {
                        resultEmbed.setDescription(`Even!\nMoney:${players[i].money}`);
                    }
                    else if(winner==1)
                    {
                        resultEmbed.setDescription(`You lose!\nMoney:${players[i].money}`);
                    }
                    else if(winner==2)
                    {
                        resultEmbed.setDescription(`You win!\nMoney:${players[i].money}`);
                    }
                    collected.reply({ embeds: [resultEmbed] });
                    break;
                }
            }

            //如果沒有資料就創建一個新的並回覆結果
            if (found == false) {
                players.push({ id: interaction.user.id, money: 500+earnings });
                let number=players.length;
                const resultEmbed = new EmbedBuilder().setTitle('Result:')
                .setColor('Blue');
                if(winner==0)
                {
                    resultEmbed.setDescription(`Even!\nMoney:${players[number-1].money}`);
                }
                else if(winner==1)
                {
                    resultEmbed.setDescription(`You lose!\nMoney:${players[number-1].money}`);
                }
                else if(winner==2)
                {
                    resultEmbed.setDescription(`You win!\nMoney:${players[number-1].money}`);
                }
                collected.reply({ embeds: [resultEmbed] });
            }

            //stringify players 並存回 players.json
            const json = JSON.stringify(players);
            fs.writeFileSync('player.json', json);

            //關閉 collector
            collector.stop();
        });
    }
};