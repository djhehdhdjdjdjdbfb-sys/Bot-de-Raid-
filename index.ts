import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  Events,
  MessageFlags,
  ApplicationIntegrationType,
  InteractionContextType,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction,
} from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("DISCORD_BOT_TOKEN is not set");
  process.exit(1);
}

const userRaidText = new Map<string, string>();

const COBRA_TEXT = `Wiggle
 Wiggle
  Wiggle
    Wiggle
      Wiggle
         Wiggle
            Wiggle
               Wiggle
                 Wiggle
                   Wiggle
                    Wiggle
                     Wiggle
                     Wiggle
                     Wiggle
                    Wiggle
                   Wiggle
                 Wiggle
               Wiggle
            Wiggle
         Wiggle
      Wiggle
    Wiggle
  Wiggle
 Wiggle
Wiggle
Wiggle
 Wiggle
  Wiggle
    Wiggle
      Wiggle
         Wiggle
            Wiggle
               Wiggle
                 Wiggle
                   Wiggle
                    Wiggle
                     Wiggle
                     Wiggle
                     Wiggle
                    Wiggle
                   Wiggle
                 Wiggle
               Wiggle
            Wiggle
         Wiggle
      Wiggle
    Wiggle
  Wiggle
 Wiggle
Wiggle
 Wiggle
  Wiggle
    Wiggle
      Wiggle
         Wiggle
            Wiggle
               Wiggle
                 Wiggle
                   Wiggle
                    Wiggle
                     Wiggle
                     Wiggle
                     Wiggle
                    Wiggle
                   Wiggle
                 Wiggle
               Wiggle
            Wiggle
         Wiggle
      Wiggle
    Wiggle
  Wiggle
 Wiggle
Wiggle
Wiggle
 Wiggle
  Wiggle
    Wiggle
      Wiggle
         Wiggle
            Wiggle
               Wiggle
                 Wiggle
                   Wiggle
                    Wiggle
                     Wiggle
                     Wiggle
                     Wiggle
                    Wiggle
                   Wiggle
                 Wiggle
               Wiggle
            Wiggle
         Wiggle
      Wiggle
    Wiggle
  Wiggle
 Wiggle
Wiggle
Wiggle
 Wiggle
  Wiggle
    Wiggle
      Wiggle
         Wiggle
         Wiggle
          Wiggle
            Wiggle
              Wiggle
              Wiggle
              Wiggle
              Wiggle`;

const CLEAR_CHAT_TEXT = "ㅤ" + "\nㅤ".repeat(990);

const EMOJI_SPAM =
  "🥵👹🍓☠️👌👈🤌🤤👺👹👺👹👺👹👹👺👹👺👹👺👹👺👹👺👹👺👹👹👺👹👺🥵🥵🥵🥵👿🥵👿🥵👿☠️👹👿👹👺☠️👺😈👿🤤🤤👺😈👺🩸🩸🩸👿😈👿🩸👿🩸👿🥵🥵🥵🥵🥵🍓👿🥵😈👺🥵👹☠️🥵👿😈☠️👺🍑🍌";

const TEAM_SPAM = `|| @everyone @here ||

-# Quem somos?
-# Somos um grupo que valoriza atitude, respeito e consciência. Não estamos aqui por acaso — cada pessoa tem um papel e sabe o que está fazendo.

-# Do bem ou do mal?
-# Nos consideramos do bem, mas não seguimos rótulos cegamente. Fazemos o que achamos certo, sem depender da opinião dos outros.

-# O que importa aqui?
-# Lealdade, postura e inteligência. Quem entra precisa entender isso desde o começo.

-#  Society Team
-# Mais do que um nome, é uma base. Organização, visão e controle sobre o que fazemos.

-# Nossa visão
-# Criar algo sólido, sem bagunça e sem gente sem compromisso. Crescer com consistência.

-# Como agimos
-# Sem impulso, sem desrespeito, sem atitudes vazias. Tudo tem um motivo.

-# Aviso
-# Se não tem responsabilidade ou só quer entrar por entrar, nem perde tempo.

-------

-# nois somos a Society team

-------

||


https://discord.gg/VctZbwZYka


|| 


https://media.discordapp.net/attachments/1464638574816268518/1496483354554535976/vjh7vfx.png?ex=69ea0c3b&is=69e8babb&hm=186b51f5f54e85709cc652d10557fde1be88bccaf8fc6c4066b3f3d60db86547&=&format=webp&quality=lossless&width=730&height=487`;

const sayCommand = new SlashCommandBuilder()
  .setName("say")
  .setDescription("O bot responde só para você com a mensagem que você digitar")
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ])
  .addStringOption((option) =>
    option
      .setName("mensagem")
      .setDescription("A mensagem que o bot vai repetir só para você")
      .setRequired(true)
      .setMaxLength(2000),
  );

const raidCommand = new SlashCommandBuilder()
  .setName("raid")
  .setDescription("Abre o painel de raid com vários comandos rápidos")
  .setIntegrationTypes([
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall,
  ])
  .setContexts([
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel,
  ]);

const commands = [sayCommand.toJSON(), raidCommand.toJSON()];

function buildRaidPanel(userId: string): {
  content: string;
  components: ActionRowBuilder<ButtonBuilder>[];
} {
  const text = userRaidText.get(userId);
  const preview = text
    ? `\`\`\`\n${text.slice(0, 500)}${text.length > 500 ? "\n..." : ""}\n\`\`\``
    : "_Nenhum texto configurado. Use o botão **Configurar texto**._";
  const content = `**Painel de Raid**\nTexto atual:\n${preview}`;

  const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("raid:config")
      .setLabel("Configurar texto")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("raid:start")
      .setLabel("Começar Raid")
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId("raid:cobra")
      .setLabel("Raid cobra")
      .setStyle(ButtonStyle.Danger),
  );

  const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("raid:clear")
      .setLabel("Clear chat")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("raid:emoji")
      .setLabel("Spamm emoji")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("raid:team")
      .setLabel("Spamm team")
      .setStyle(ButtonStyle.Secondary),
  );

  return { content, components: [row1, row2] };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendMultiplePublic(
  interaction: ButtonInteraction,
  text: string,
  count: number,
): Promise<void> {
  for (let i = 0; i < count; i++) {
    try {
      await interaction.followUp({ content: text });
    } catch (error) {
      console.error(`Erro ao enviar mensagem ${i + 1}/${count}:`, error);
    }
    if (i < count - 1) {
      await sleep(800);
    }
  }
}

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Bot conectado como ${readyClient.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(token);
    console.log("Registrando comandos slash globalmente...");
    await rest.put(Routes.applicationCommands(readyClient.user.id), {
      body: commands,
    });
    console.log(
      "Comandos slash registrados. Pode levar alguns minutos para aparecer em todos os servidores.",
    );
  } catch (error) {
    console.error("Erro ao registrar comandos slash:", error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "say") {
        const mensagem = interaction.options.getString("mensagem", true);

        await interaction.reply({
          content: "say mandado",
          flags: MessageFlags.Ephemeral,
        });

        try {
          await interaction.followUp({ content: mensagem });
        } catch (error) {
          console.error("Erro ao enviar mensagem pública do /say:", error);
        }
        return;
      }

      if (interaction.commandName === "raid") {
        const panel = buildRaidPanel(interaction.user.id);
        await interaction.reply({
          ...panel,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    if (interaction.isButton()) {
      const id = interaction.customId;

      if (id === "raid:config") {
        const modal = new ModalBuilder()
          .setCustomId("raid:set_text_modal")
          .setTitle("Configurar texto do raid");
        const input = new TextInputBuilder()
          .setCustomId("raid:text_input")
          .setLabel("Texto que será enviado no Começar Raid")
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
          .setMaxLength(2000);
        const existing = userRaidText.get(interaction.user.id);
        if (existing) {
          input.setValue(existing);
        }
        modal.addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(input),
        );
        await interaction.showModal(modal);
        return;
      }

      if (id === "raid:start") {
        const text = userRaidText.get(interaction.user.id);
        if (!text) {
          await interaction.reply({
            content:
              "Você ainda não configurou um texto. Aperte **Configurar texto** primeiro.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
        await interaction.reply({
          content: "Raid iniciado!",
          flags: MessageFlags.Ephemeral,
        });
        await sendMultiplePublic(interaction, text, 5);
        return;
      }

      if (id === "raid:cobra") {
        await interaction.reply({
          content: "Raid cobra iniciado!",
          flags: MessageFlags.Ephemeral,
        });
        await sendMultiplePublic(interaction, COBRA_TEXT, 5);
        return;
      }

      if (id === "raid:clear") {
        await interaction.reply({
          content: "Limpando o chat...",
          flags: MessageFlags.Ephemeral,
        });
        try {
          await interaction.followUp({ content: CLEAR_CHAT_TEXT });
        } catch (error) {
          console.error("Erro ao enviar clear chat:", error);
        }
        return;
      }

      if (id === "raid:emoji") {
        await interaction.reply({
          content: "Spam de emoji enviado!",
          flags: MessageFlags.Ephemeral,
        });
        try {
          await interaction.followUp({ content: EMOJI_SPAM });
        } catch (error) {
          console.error("Erro ao enviar spamm emoji:", error);
        }
        return;
      }

      if (id === "raid:team") {
        await interaction.reply({
          content: "Spam de team iniciado!",
          flags: MessageFlags.Ephemeral,
        });
        await sendMultiplePublic(interaction, TEAM_SPAM, 5);
        return;
      }
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId === "raid:set_text_modal") {
        const text = interaction.fields.getTextInputValue("raid:text_input");
        userRaidText.set(interaction.user.id, text);
        const panel = buildRaidPanel(interaction.user.id);
        if (interaction.isFromMessage()) {
          await interaction.update(panel);
        } else {
          await interaction.reply({
            content: "Texto salvo!",
            flags: MessageFlags.Ephemeral,
          });
        }
        return;
      }
    }
  } catch (error) {
    console.error("Erro ao processar interação:", error);
    try {
      if (
        interaction.isRepliable() &&
        !interaction.replied &&
        !interaction.deferred
      ) {
        await interaction.reply({
          content: "Houve um erro ao processar essa ação.",
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (replyError) {
      console.error("Erro ao notificar falha:", replyError);
    }
  }
});

client.on(Events.Error, (error) => {
  console.error("Erro no client do Discord:", error);
});

process.on("SIGTERM", () => {
  console.log("Encerrando bot...");
  client.destroy();
  process.exit(0);
});

client.login(token).catch((error) => {
  console.error("Falha ao fazer login no Discord:", error);
  process.exit(1);
});
