const { SlashCommandBuilder ,EmbedBuilder} = require("discord.js");


module.exports = {
    data: new SlashCommandBuilder().setName("ping").setDescription("reply with pong!"),
    async execute(client, interaction) {

        const embed = new EmbedBuilder().setTitle("pong!").setColor("Aqua").setDescription(`<@${interaction.user.id}> 你要繼續ping嗎?`)

        await interaction.reply({embeds: [embed]});
    },
};
