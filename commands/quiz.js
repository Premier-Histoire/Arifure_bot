const { SlashCommandBuilder, EmbedBuilder } = require("discord.js")
const fs = require("fs")
const path = require("path")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quiz")
    .setDescription("検索してquiz.jsonから問題の候補を表示して答えを表示します")
    .addStringOption((option) => option.setName("keyword").setDescription("検索キーワード").setRequired(true)),
  execute: async (interaction) => {
    const keyword = interaction.options.getString("問題文")

    // quiz.jsonを読み込む
    const quizFilePath = path.join(__dirname, "..", "quiz.json")
    let quizData
    try {
      quizData = JSON.parse(fs.readFileSync(quizFilePath, "utf8"))
    } catch (error) {
      console.error("Error reading quiz.json:", error)
      await interaction.reply({ content: "クイズデータの読み込みに失敗しました。", ephemeral: true })
      return
    }

    // キーワードを含む問題を検索
    const matchingQuizzes = quizData.filter((quiz) => quiz["クイズ問題"].toLowerCase().includes(keyword.toLowerCase()))

    if (matchingQuizzes.length === 0) {
      await interaction.reply({ content: "該当する問題が見つかりませんでした。", ephemeral: true })
      return
    }

    // Embedを作成
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`"${keyword}" に関連するクイズ`)
      .setDescription(`${matchingQuizzes.length}件のクイズが見つかりました。`)
      .setTimestamp()

    // 最大25件のクイズを表示（Discordの制限による）
    const displayQuizzes = matchingQuizzes.slice(0, 25)

    displayQuizzes.forEach((quiz, index) => {
      embed.addFields(
        { name: `問題 ${index + 1}`, value: quiz["クイズ問題"] },
        { name: `答え ${index + 1}`, value: quiz["答え"], inline: true },
      )
    })

    if (matchingQuizzes.length > 25) {
      embed.setFooter({ text: `表示されている ${displayQuizzes.length} 件 / 合計 ${matchingQuizzes.length} 件` })
    }

    // Embedを送信
    await interaction.reply({ embeds: [embed] })
  },
}

