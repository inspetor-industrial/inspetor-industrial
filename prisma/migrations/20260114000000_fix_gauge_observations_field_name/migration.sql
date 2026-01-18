-- AlterTable: Garantir que o campo tenha o nome correto
-- Remover coluna antiga se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'BoilerReport' 
    AND column_name = 'gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation'
  ) THEN
    ALTER TABLE "BoilerReport" DROP COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservation";
  END IF;
END $$;

-- Adicionar coluna correta se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'BoilerReport' 
    AND column_name = 'gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations'
  ) THEN
    ALTER TABLE "BoilerReport" ADD COLUMN "gaugeOfElectricOrElectronicControlDevicesAndCommandsObservations" TEXT;
  END IF;
END $$;
