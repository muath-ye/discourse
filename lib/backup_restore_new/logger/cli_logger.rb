# frozen_string_literal: true

require 'colored2'
require 'ruby-progressbar'
require_relative 'progress_logger'
require_relative 'spinner'

module BackupRestoreNew
  module Logger
    class CliLogger < BaseLogger
      include HasSpinner

      def initialize(name)
        super()

        timestamp = Time.now.utc.strftime("%Y-%m-%dT%H%M%SZ")
        current_db = RailsMultisite::ConnectionManagement.current_db
        path = File.join(Rails.root, "log", "backups", current_db)
        FileUtils.mkdir_p(path)
        path = File.join(path, "#{name}-#{timestamp}.log")

        @logfile = File.new(path, "w")
        log_to_stdout("Logging to #{path}")
      end

      def close
        @logfile.close
      end

      def log_step(message, with_progress: false)
        if with_progress
          logger = ProgressLogger.new(message, self)
          begin
            yield(logger)
            logger.success
          rescue Exception
            logger.error
            raise
          end
        else
          spin(message, abort_on_error: false) do
            yield
          end
        end
        nil
      end

      def log(message, level: BackupRestoreNew::Logger::INFO)
        log_to_stdout(message, level)
        log_to_logfile(message, level)
      end

      def log_to_stdout(message, level = BackupRestoreNew::Logger::INFO)
        case level
        when BackupRestoreNew::Logger::INFO
          puts "INFO ".blue + " #{message}"
        when BackupRestoreNew::Logger::ERROR
          puts "FAIL ".red + " #{message}"
        when BackupRestoreNew::Logger::WARNING
          puts "WARN ".yellow + " #{message}"
        else
          puts message
        end
      end

      def log_to_logfile(message, level = BackupRestoreNew::Logger::INFO)
        timestamp = Time.now.utc.iso8601

        case level
        when BackupRestoreNew::Logger::INFO
          @logfile.puts("[#{timestamp}] INFO: #{message}")
        when BackupRestoreNew::Logger::ERROR
          @logfile.puts("[#{timestamp}] ERROR: #{message}")
        when BackupRestoreNew::Logger::WARNING
          @logfile.puts("[#{timestamp}] WARN: #{message}")
        else
          @logfile.puts("[#{timestamp}] #{message}")
        end
      end
    end
  end
end
