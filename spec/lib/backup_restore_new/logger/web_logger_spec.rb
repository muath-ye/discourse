# frozen_string_literal: true

require 'rails_helper'

describe BackupRestoreNew::Logger::WebLogger do
  fab!(:admin) { Fabricate(:admin) }
  let(:operation) { "backup" }
  subject { described_class.new(admin.id, 42, operation) }

  describe "#log_event" do
    it "should publish a message" do
      messages = MessageBus.track_publish { subject.log_event("Foo") }
      expect(messages.size).to eq(1)
      expect(messages.first).to have_attributes(channel: BackupRestoreNew::LOGS_CHANNEL)
      expect(messages.first.data).to include(operation: "backup", message: "Foo")
    end
  end

  describe "#log_step" do

  end

  describe "#log" do

  end

  describe "#log_warning" do

  end

  describe "#log_error" do

  end

  describe "#warnings?" do
    it "returns true when warnings have been logged with `#log_warning`" do
      expect(subject.warnings?).to eq(false)
      subject.log_warning("Foo")
      expect(subject.warnings?).to eq(true)
    end

    it "returns true when warnings have been logged with `#log`" do
      expect(subject.warnings?).to eq(false)

      subject.log_error("Error")
      expect(subject.warnings?).to eq(false)

      subject.log("Foo")
      expect(subject.warnings?).to eq(false)

      subject.log("Error", level: BackupRestoreNew::Logger::ERROR)
      expect(subject.warnings?).to eq(false)

      subject.log("Warning", level: BackupRestoreNew::Logger::WARNING)
      expect(subject.warnings?).to eq(true)
    end
  end

  describe "#errors?" do
    it "returns true when errors have been logged with `#log_error`" do
      expect(subject.errors?).to eq(false)
      subject.log_error("Foo")
      expect(subject.errors?).to eq(true)
    end

    it "returns true when warnings have been logged with `#log`" do
      expect(subject.errors?).to eq(false)

      subject.log_warning("Warning")
      expect(subject.errors?).to eq(false)

      subject.log("Foo")
      expect(subject.errors?).to eq(false)

      subject.log("Warning", level: BackupRestoreNew::Logger::WARNING)
      expect(subject.errors?).to eq(false)

      subject.log("Error", level: BackupRestoreNew::Logger::ERROR)
      expect(subject.errors?).to eq(true)
    end
  end
end
