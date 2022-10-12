# frozen_string_literal: true

require 'colored2'
require 'ruby-progressbar'
require_relative 'spinner'

module DiscourseCLI
  class ProgressLogger < BackupRestoreNew::Logger::BaseProgressLogger
    def initialize(message, logger)
      @message = message
      @logger = logger

      @progressbar = ProgressBar.create(
        format: " %j%%  %t | %c / %C | %E",
        title: @message,
        autofinish: false,
        smoothing: 0.5
      )
    end

    def start(max_progress)
      @progress = 0
      @max_progress = max_progress

      @progressbar.progress = @progress
      @progressbar.total = @max_progress

      log_progress
    end

    def increment
      @progress += 1
      @progressbar.increment
      log_progress if @progress % 50 == 0
    end

    def log(message, ex = nil)
      @logger.log_to_logfile(message, BackupRestoreNew::Logger::WARNING)
    end

    def success
      reset_current_line
      @progressbar.format = "%t | %c / %C | %E"
      @progressbar.title = "DONE ".green + " #{@message}"
      @progressbar.finish
    end

    def error
      reset_current_line
      @progressbar.format = "%t | %c / %C | %E"
      @progressbar.title = "FAIL ".red + " #{@message}"
      @progressbar.finish
    end

    private

    def log_progress
      @logger.log_to_logfile("#{@message} | #{@progress} / #{@max_progress}")
    end

    def reset_current_line
      print "\033[K" # delete the output of progressbar, because it doesn't overwrite longer lines
    end
  end
end
