const { Group, User } = require('../models');
const createError = require('http-errors');

module.exports.createUserGroup = async (req, res, next) => {
  try {
    const { body } = req;
    console.log('body = ', body);
    const group = await Group.create({
      name: body.name,
      imagePath: body.imagePath,
      description: body.description,
      userId: body.userId,
    });
    if (!group) {
      return next(createError(400, 'Bad Request. Group was not created'));
    }
    const user = await User.findByPk(body.userId, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    group.addUser(user);
    res.status(201).send({ data: group });
  } catch (err) {
    next(err);
  }
};

module.exports.getUserGroup = async (req, res, next) => {
  try {
    const {
      params: { userId },
    } = req;
    const userWithGroups = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          through: { attributes: [] },
        },
      ],
    });
    if (!userWithGroups) {
      return next(createError(404));
    }
    res.status(200).send(userWithGroups);
  } catch (err) {
    next(err);
  }
};

module.exports.deleteGroup = async (req, res, next) => {
  try {
    const {
      params: { groupId },
    } = req;
    const groupToDelete = await Group.findByPk(groupId);
    if (!groupToDelete) {
      return next(createError(404, 'Group not found'));
    }
    const result = await groupToDelete.destroy();
    res.status(202).send({ data: groupToDelete });
  } catch (err) {
    next(err);
  }
};
