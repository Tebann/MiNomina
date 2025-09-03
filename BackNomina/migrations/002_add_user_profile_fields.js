/**
 * Migration: Add User Profile Fields
 * 
 * This migration adds additional profile fields to the User table:
 * - fullName (string)
 * - company (string)
 * - rut (string)
 * - companyEmail (string)
 * - position (string)
 * - accountCreationDate (date)
 */

const { sequelize } = require('../connection/db/database');
const { DataTypes } = require('sequelize');

// Function to run the migration
async function up() {
  try {
    // Add columns to the Users table
    await sequelize.getQueryInterface().addColumn('Users', 'fullName', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await sequelize.getQueryInterface().addColumn('Users', 'company', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await sequelize.getQueryInterface().addColumn('Users', 'rut', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await sequelize.getQueryInterface().addColumn('Users', 'companyEmail', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await sequelize.getQueryInterface().addColumn('Users', 'position', {
      type: DataTypes.STRING,
      allowNull: true
    });

    await sequelize.getQueryInterface().addColumn('Users', 'accountCreationDate', {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    });

    console.log('Migration 002_add_user_profile_fields completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in migration 002_add_user_profile_fields:', error);
    return { success: false, error };
  }
}

// Function to undo the migration
async function down() {
  try {
    // Remove columns from the Users table
    await sequelize.getQueryInterface().removeColumn('Users', 'fullName');
    await sequelize.getQueryInterface().removeColumn('Users', 'company');
    await sequelize.getQueryInterface().removeColumn('Users', 'rut');
    await sequelize.getQueryInterface().removeColumn('Users', 'companyEmail');
    await sequelize.getQueryInterface().removeColumn('Users', 'position');
    await sequelize.getQueryInterface().removeColumn('Users', 'accountCreationDate');

    console.log('Rollback of migration 002_add_user_profile_fields completed successfully');
    return { success: true };
  } catch (error) {
    console.error('Error in rollback of migration 002_add_user_profile_fields:', error);
    return { success: false, error };
  }
}

module.exports = {
  name: '002_add_user_profile_fields',
  up,
  down,
  description: 'Add user profile fields'
};