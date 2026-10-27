import { Command } from 'commander';
import fs from 'fs';

const program = new Command();

// Глобальна опція працює для всіх команд
program
  .name('football-cli')
  .description('CLI програма для роботи з даними футбольного турніру')
  .version('1.0.0')
  .option('-f, --file <path>', 'шлях до JSON-файлу', 'lab1_tournament.json');

// Допоміжна функція для читання файлу
function readData(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`Помилка: Файл "${filePath}" не знайдено.`);
    } else if (error instanceof SyntaxError) {
      console.error(`Помилка: Файл "${filePath}" містить некоректний JSON.`);
    } else {
      console.error('Сталася помилка при читанні файлу.');
    }
    process.exit(1); // Ненульовий код завершення згідно з вимогами
  }
}

// Команда 1: Перелік основних елементів
program
  .command('list')
  .description('Показати список команд турніру')
  .option('-l, --limit <number>', 'обмежити кількість виведених команд')
  .action((options) => {
    // Отримуємо значення глобальної опції --file
    const globalOptions = program.opts(); 
    const data = readData(globalOptions.file);

    let teams = data.teams;

    // Обробка опції ліміту
    if (options.limit) {
      const limit = parseInt(options.limit, 10);
      if (isNaN(limit) || limit <= 0) {
        console.error('Помилка: Ліміт має бути додатним числом.');
        process.exit(1);
      }
      teams = teams.slice(0, limit);
    }

    console.log(`Список команд (всього: ${teams.length}):`);
    teams.forEach((team, index) => {
      console.log(`${index + 1}. ${team.team_name} (Тренер: ${team.coach})`);
    });
  });

// Команда 2: Один елемент
program
  .command('team <name>')
  .description('Показати повну інформацію про вказану команду')
  .action((name) => {
    const globalOptions = program.opts();
    const data = readData(globalOptions.file);

    // Шукаємо команду без урахування регістру
    const foundTeam = data.teams.find(
      t => t.team_name.toLowerCase() === name.toLowerCase()
    );

    if (!foundTeam) {
      console.error(`Помилка: Команду з назвою "${name}" не знайдено.`);
      process.exit(1);
    }

    console.log(`--- Інформація про команду "${foundTeam.team_name}" ---`);
    console.log(JSON.stringify(foundTeam, null, 2));
  });

// Команда 3: Окреме поле
program
  .command('players <teamName>')
  .description('Показати список гравців (вкладене поле) вказаної команди')
  .action((teamName) => {
    const globalOptions = program.opts();
    const data = readData(globalOptions.file);

    const foundTeam = data.teams.find(
      t => t.team_name.toLowerCase() === teamName.toLowerCase()
    );

    if (!foundTeam) {
      console.error(`Помилка: Команду з назвою "${teamName}" не знайдено.`);
      process.exit(1);
    }

    // Обробка відсутнього поля або порожнього масиву
    if (!foundTeam.players || foundTeam.players.length === 0) {
      console.log(`У команди "${foundTeam.team_name}" немає заявлених гравців (поле порожнє або null).`);
      return;
    }

    console.log(`--- Гравці команди "${foundTeam.team_name}" ---`);
    foundTeam.players.forEach((player, index) => {
      console.log(`${index + 1}. ${player.name} (№${player.number}, Позиція: ${player.position})`);
    });
  });

program.parse(process.argv);