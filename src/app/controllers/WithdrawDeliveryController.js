import { startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import Delivery from '../models/Delivery';

class WithdrawDeliveryController {
  async update(req, res) {
    const { deliveryman_id, delivery_id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);

    // Checking if the deliveryman exists
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Deliveryman ID does not exist.' });
    }

    // Search query
    const deliveryExists = await Delivery.findByPk(delivery_id, {
      include: {
        model: Deliveryman,
        as: 'deliveryman',
        attributes: ['id'],
      },
    });

    // Verifications
    if (!deliveryExists) {
      return res.status(400).json({ error: 'Delivery ID does not exist.' });
    }
    if (deliveryExists.deliveryman.id !== Number(deliveryman_id)) {
      return res.status(400).json({
        error: `You cannot withdraw other people's delivery.`,
      });
    }
    if (deliveryExists.canceled_at) {
      return res.status(400).json({
        error: 'Delivery has been canceled.',
      });
    }
    if (deliveryExists.start_date) {
      return res.status(400).json({
        error: 'Delivery has already been withdrawn.',
      });
    }
    if (deliveryExists.end_date) {
      return res.status(400).json({
        error: 'Delivery has already been delivered.',
      });
    }

    const withdrawHour = new Date().getHours();

    // Check if the withdraw is between 08:00 and 18:00h.
    if (withdrawHour < 8 || withdrawHour > 18) {
      return res.status(400).json({
        error: 'You can only withdraw from 08:00h to 18:00h.',
      });
    }

    const today = new Date().valueOf();

    // Search query
    const todayWithdraws = await Delivery.findAll({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(today), endOfDay(today)],
        },
      },
    });

    // Checking if the max withdraw per day is reached
    if (todayWithdraws.length >= 5) {
      return res.status(400).json({
        error: 'You can only withdraw up to 5 deliveries per day',
      });
    }

    const delivery = deliveryExists;

    const updatedDelivery = await delivery.update({
      start_date: new Date(),
    });

    return res.json(updatedDelivery);
  }
}

export default new WithdrawDeliveryController();
