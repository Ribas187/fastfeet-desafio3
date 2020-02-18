import Sequelize, { Model } from 'sequelize';

// Recipient model
class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        complement: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        postcode: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'recipient',
      }
    );
    return this;
  }
}

export default Recipient;
