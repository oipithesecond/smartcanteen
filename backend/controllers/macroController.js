const MacroPeriod = require('../models/MacroPeriod');

exports.getMacros = async (req, res) => {
    try {
        const macros = await MacroPeriod.find().sort({ startDate: 1 });
        res.status(200).json(macros);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch macros" });
    }
};

exports.addMacro = async (req, res) => {
    try {
        const newMacro = new MacroPeriod(req.body);
        await newMacro.save();
        res.status(201).json(newMacro);
    } catch (err) {
        res.status(500).json({ error: "Failed to add macro" });
    }
};

exports.deleteMacro = async (req, res) => {
    try {
        await MacroPeriod.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Macro deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete macro" });
    }
};
