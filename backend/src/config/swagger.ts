import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Hisaab Kitaab API",
      version: "1.0.0",
      description: "API documentation for Hisaab Kitaab Module",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/*.ts"], // dev mode
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;