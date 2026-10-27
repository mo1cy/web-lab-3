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

program.parse(process.argv);