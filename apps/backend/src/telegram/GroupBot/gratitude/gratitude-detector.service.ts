import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { NlpManager } from 'node-nlp';
import { AppLoggerService } from 'src/modules/logger/logger.service';

@Injectable()
export class GratitudeDetectorService {
  private nlpManager: NlpManager;
  private exceptions: Set<string> = new Set();

  constructor(private readonly loggerService: AppLoggerService) {
    this.initializeNLP().catch((error) => {
      loggerService.error('Ошибка при инициализации NLP', error);
    });
    this.loadExceptions();
  }

  private async initializeNLP() {
    this.nlpManager = new NlpManager({ languages: ['ru'], forceNER: true });

    const modelPath = path.join(
      process.cwd(),
      'src/telegram/GroupBot/gratitude/model.nlp',
    );

    if (fs.existsSync(modelPath)) {
      // Если модель уже есть — загружаем
      this.nlpManager.load(modelPath);
      this.loggerService.log('Загружена существующая модель NLP');

      return;
    }

    // Загрузка шаблонов
    const configPath = path.join(
      process.cwd(),
      'src/telegram/groupBot/gratitude/gratitude-words.json',
    );
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Добавление шаблонов в NLP
    config.patterns.forEach((pattern: string) => {
      this.nlpManager.addDocument('ru', pattern, 'gratitude');
    });

    // Обучение и сохранение
    await this.nlpManager.train();
    await this.nlpManager.save(modelPath);
    this.loggerService.log('Создана и сохранена новая модель NLP');
  }

  private loadExceptions() {
    const configPath = path.join(
      process.cwd(),
      'src/telegram/groupBot/gratitude/gratitude-words.json',
    );
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    config.exceptions.forEach((word: string) => {
      this.exceptions.add(word.toLowerCase());
    });
  }

  public async isGratitude(text: string): Promise<boolean> {
    if (!text || text.trim().length < 2) return false;

    const cleanText = text.toLowerCase().trim();

    // 1. Сначала проверяем точные совпадения с исключениями
    const isException = Array.from(this.exceptions).some(
      (exception) =>
        cleanText === exception || // Точное совпадение
        new RegExp(`\\b${exception}\\b`).test(cleanText), // Как отдельное слово
    );

    if (isException) {
      return false;
    }

    // 2. Проверяем на благодарность
    try {
      const result = await this.nlpManager.process('ru', text);
      const isGratitude = result.intent === 'gratitude' && result.score > 0.8;

      return isGratitude;
    } catch (error) {
      this.loggerService.error('Ошибка при проверке благодарности', error);

      return false;
    }
  }
}
