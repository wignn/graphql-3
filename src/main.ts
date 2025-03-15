import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { GraphQLErrorFilter } from './filters/custom-exception.filter';
import { ApolloError } from 'apollo-server-express';
import * as cookieParser from 'cookie-parser';
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:5175', 'http://127.0.0.1:5175'], 
    credentials: true,
    
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization',  'apollo-require-preflight', 'apollo-tracing', 'apollo-query-plan-tracing'
  ]});
  
  app.use(graphqlUploadExpress({ maxFileSize: 10000000000, maxFiles: 10 }));
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.reduce((accumulator, error) => {
          accumulator[error.property] = Object.values(error.constraints).join(
            ', ',
          );
          return accumulator;
        }, {});
        console.log('formattedErrors123', formattedErrors);
        // return formatted errors being an object with properties mapping to errors
        throw new BadRequestException(formattedErrors);
      },
    }),
  );
  app.useGlobalFilters(new GraphQLErrorFilter());
  await app.listen(3000);
}
bootstrap();
