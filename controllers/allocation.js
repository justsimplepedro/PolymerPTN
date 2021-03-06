// first we import our dependencies…
const express = require('express');
const Allocation = require('../models/allocation');
const Blocking = require('../models/blocking');
const Booking = require('../models/booking');
const Availability = require('../models/availability_model');
const Hotels = require('../models/hotels_model');
// and create our instances
const router = express.Router();

router.get('/dummy', (req, res) => {
    return res.json({ success: true, data: [] });
});
router.post('/add', (req, res) => {
    const allocation = new Allocation();
    // body parser lets us use the req.body
    const { group, hotel, hotelname, dateFrom, dateTo, rooms, note, pk_coff, npk_coff, high_coff, seasondate, created_by, updated_by } = req.body;
    if (!group || !hotel || !dateFrom || !dateTo || !note) {
        return res.json({
            success: false,
            error: 'Not Found'
        });
    }
    // allocation.active = active;
    allocation.group = group;
    allocation.hotel = hotel;
    allocation.hotelname = hotelname;
    allocation.dateFrom = dateFrom;
    allocation.dateTo = dateTo;
    allocation.rooms = rooms;
    allocation.note = note;
    allocation.pk_coff = pk_coff;
    allocation.npk_coff = npk_coff;
    allocation.high_coff = high_coff;
    allocation.seasondate = seasondate;
    allocation.created_by = created_by,
        allocation.updated_by = updated_by,
        allocation.save(err => {
            if (err) return res.json({ success: false, error: err });
            return res.json({ success: true });
        });
});



router.get('/read', (req, res) => {
    Allocation.find((err, allocation) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: allocation });
    });
});
router.get('/readEdit/:editKey', (req, res) => {
    const editKey = req.params.editKey;
    Allocation.findById({ _id: editKey }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});

router.get('/filterallocall/:xparameter', (req, res) => {
    const [group, hotel, room] = req.params.xparameter.split("_");
    Allocation.find(
        {
            group: group,
            hotel: hotel,
            $and: [
                {
                    "rooms.room": room
                }
            ]
        }, (error, allocdata) => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true, data: allocdata });
        });
});

router.put('/update/:editKey', (req, res) => {
    const { editKey } = req.params;
    if (!editKey) {
        return res.json({ success: false, error: 'not match found' });
    }
    Allocation.findById(editKey, (error, allocation) => {
        if (error) return res.json({ success: false, error });
        const { group, hotelname, dateFrom, dateTo, rooms, note, pk_coff, npk_coff, high_coff, seasondate, created_by, updated_by } = req.body;
        // allocation.active = active;
        if (group) allocation.group = group;
        // if (hotel) allocation.hotel = hotel;
        if (hotelname) allocation.hotelname = hotelname;
        if (dateFrom) allocation.dateFrom = dateFrom;
        if (dateTo) allocation.dateTo = dateTo;
        if (rooms) allocation.rooms = rooms;
        if (note) allocation.note = note;
        if (pk_coff) allocation.pk_coff = pk_coff;
        if (npk_coff) allocation.npk_coff = npk_coff;
        allocation.high_coff = high_coff;
        if (seasondate) allocation.seasondate = seasondate;
        allocation.created_by = created_by;
        allocation.updated_by = updated_by;
        allocation.save(error => {
            if (error) return res.json({ success: false, error });
            return res.json({ success: true });
        });
    });
});
router.delete('/delete/:editKey', (req, res) => {
    const { editKey } = req.params;
    // console.log(editKey);
    if (!editKey) {
        return res.json({ success: false, error: 'No comment id provided' });
    }
    Allocation.remove({ _id: editKey }, (error, hotel) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true });
    });
});

router.get('/filter/:hotel', (req, res) => {
    const hotel = req.params.hotel;
    Allocation.findOne({ hotel: hotel }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});
router.get('/filterR/:room', (req, res) => {
    const room = req.params.room;
    Allocation.findOne({ room: room }, (error, rooms) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: rooms });
    });
});

router.get('/filterG/:groupKey', (req, res) => {
    const groupKey = req.params.groupKey;
    Allocation.find({ group: groupKey }, (error, hotels) => {
        if (error) return res.json({ success: false, error });
        return res.json({ success: true, data: hotels });
    });
});
router.get('/inquirySource2/:xparams', getAvailability, getAllocation, getBlocking, getBooking, (req, res) => {
    const [hotelParam,datefrom, dateto, group, agent,room] = req.params.xparams.split("_");
    var inquiry = req.body.inquiry;
    var [p, t] = group.split(",");
    p = p === "undefined" ? undefined : p;
    t = t === "undefined" ? undefined : t;
    var _dates = [];
    var xdate = new Date(datefrom);
    var _dateTo = new Date(dateto);
    while (xdate <= _dateTo) {
        _dates.push(new Date(xdate));
        xdate.setDate(xdate.getDate() + 1);
    }
    // try{}catch(error){return res.json({success:false,error:})}
    var hotelResult =[];
    Hotels.find((err, hotels) => {
        if(hotelParam!="")
        {
            hotelResult = hotels.filter(filter=>filter.hotel==hotelParam);
        }else
        {
            hotelResult=hotels;
        }
        if (err) return res.json({ success: false, error: err });
        var rawdata = [];
        hotelResult.forEach(hotel => {
            hotel.room.forEach(_room => {
                var _xdates = [];
                _dates.forEach(cdate => {
                    var _cdate_foravailability = new Date(cdate);
                    var _cdate_foravailability_str = _cdate_foravailability.getFullYear() + "-" + ("0" + (_cdate_foravailability.getMonth())).slice(-2) + "-" + ("0" + _cdate_foravailability.getDate()).slice(-2);
                    var _cdate_str = _cdate_foravailability.getFullYear() + "-" + ("0" + (_cdate_foravailability.getMonth() + 1)).slice(-2) + "-" + ("0" + _cdate_foravailability.getDate()).slice(-2);

                    var _x_availability = inquiry[0].filter(f => (f.date >= _cdate_foravailability_str && f.date <= _cdate_foravailability_str) && f.hotel == hotel.hotel && f.room === _room.room.split(" ").join(""));
                    var _x_allocation = inquiry[1].filter(f => (_cdate_str >= f.dateFrom && _cdate_str <= f.dateTo) && f.hotel == hotel.hotel && f.room == _room.room);
                    var _x_blocking = inquiry[2].filter(f => (_cdate_str >= f.dateFrom && _cdate_str < f.dateTo) && f.hotel == hotel.hotel && f.room == _room.room);
                    var _x_booking = inquiry[3].filter(f => (_cdate_str >= f.checkin && _cdate_str < f.checkout) && f.hotel == hotel.hotel && f.room == _room.room);

                    var x_block = 0;
                    var x_blocking = [];
                    _x_blocking.forEach(element => {
                        x_blocking = [{
                            agent: element.agent,
                            group: element.group,
                            hotel: element.hotel,
                            hotelname: element.hotelname,
                            room: element.room,
                            roomname: element.roomname,
                            block: x_block += parseInt(element.block),
                            cancel: element.cancel,
                            dateFrom: element.dateFrom,
                            dateTo: element.dateTo,
                            updatedAt: element.updatedAt,
                        }];
                    });

                    var x_book = [], tabi = [], ptn = [], pblock = [], wblock = [], nblock = [];
                    var numroomss = 0, numroom = 0, numrooms = 0, wbrooms = 0;
                    if (p && t) {
                        // x_book = _x_booking;
                        _x_booking.forEach(_elebook => {
                            if (_elebook.group) {
                                if (_elebook.group === p) {
                                    ptn = [{
                                        agent: _elebook.agent,
                                        agentname: _elebook.agentname,
                                        checkin: _elebook.checkin,
                                        checkout: _elebook.checkout,
                                        deduction: _elebook.deduction,
                                        group: _elebook.group,
                                        hotel: _elebook.hotel,
                                        hotelname: _elebook.hotelname,
                                        numrooms: numroom += parseInt(_elebook.numrooms),
                                        room: _elebook.room,
                                        roomname: _elebook.roomname,
                                        updatedAt: _elebook.updatedAt
                                    }];
                                } else {
                                    tabi = [{
                                        agent: _elebook.agent,
                                        agentname: _elebook.agentname,
                                        checkin: _elebook.checkin,
                                        checkout: _elebook.checkout,
                                        deduction: _elebook.deduction,
                                        group: _elebook.group,
                                        hotel: _elebook.hotel,
                                        hotelname: _elebook.hotelname,
                                        numrooms: numroomss += parseInt(_elebook.numrooms),
                                        room: _elebook.room,
                                        roomname: _elebook.roomname,
                                        updatedAt: _elebook.updatedAt
                                    }];
                                }
                            } else {
                                var blockroom = 0;
                                if (_elebook.agent === agent) {
                                    pblock = [{
                                        agent: _elebook.agent,
                                        agentname: _elebook.agentname,
                                        checkin: _elebook.checkin,
                                        checkout: _elebook.checkout,
                                        deduction: _elebook.deduction,
                                        group: _elebook.group,
                                        hotel: _elebook.hotel,
                                        hotelname: _elebook.hotelname,
                                        numrooms: blockroom += parseInt(_elebook.numrooms),
                                        room: _elebook.room,
                                        roomname: _elebook.roomname,
                                        updatedAt: _elebook.updatedAt
                                    }];
                                }
                            }
                        });
                        if (tabi.length > 0 && ptn.length == 0) {
                            tabi.forEach(ele => {
                                x_book = [ele];
                            });
                        } else if (ptn.length > 0 && tabi.length == 0) {
                            ptn.forEach(eles => {
                                x_book = [eles];
                            });
                        } else if ((tabi.length && ptn.length) > 0) {
                            tabi.forEach(ele => {
                                ptn.forEach(eles => {
                                    x_book.push(ele, eles);
                                });
                            });
                        }
                    } else {
                        //  x_book = _x_booking;
                        _x_booking.forEach(_elbook => {
                            if (_elbook.group === p) {
                                nblock = [{
                                    agent: _elbook.agent,
                                    agentname: _elbook.agentname,
                                    checkin: _elbook.checkin,
                                    checkout: _elbook.checkout,
                                    deduction: _elbook.deduction,
                                    group: _elbook.group,
                                    hotel: _elbook.hotel,
                                    hotelname: _elbook.hotelname,
                                    numrooms: numrooms += parseInt(_elbook.numrooms),
                                    room: _elbook.room,
                                    roomname: _elbook.roomname,
                                    updatedAt: _elbook.updatedAt
                                }];
                            } else {

                                if (_elbook.agent === agent) {
                                    wblock = [{
                                        agent: _elbook.agent,
                                        agentname: _elbook.agentname,
                                        checkin: _elbook.checkin,
                                        checkout: _elbook.checkout,
                                        deduction: _elbook.deduction,
                                        group: _elbook.group,
                                        hotel: _elbook.hotel,
                                        hotelname: _elbook.hotelname,
                                        numrooms: wbrooms += parseInt(_elbook.numrooms),
                                        room: _elbook.room,
                                        roomname: _elbook.roomname,
                                        updatedAt: _elbook.updatedAt
                                    }];
                                }
                            }
                        });
                        if (nblock.length > 0 && wblock.length == 0) {
                            nblock.forEach(els => {
                                x_book = [els];
                            });
                        } else if (wblock.length > 0 && nblock.length == 0) {
                            wblock.forEach(all => {
                                x_book = [all];
                            });
                        } else if (wblock.length > 0 && nblock.length > 0) {
                            wblock.forEach(elas => {
                                nblock.forEach(alls => {
                                    x_book.push(alls, elas);
                                });
                            });
                        }
                    }
                    var _x_alloc = [];
                    if (p && t) {
                        _x_allocation.forEach(element => {
                            if (element.group === p || t) {
                                _x_alloc.push(element);
                            }
                        });
                    } else {
                        _x_allocation.forEach(element => {
                            if (element.group === p) {
                                _x_alloc.push(element);
                            }
                        });
                    }

                    var seasondates_x = [];
                    _x_allocation.forEach(element => {
                        if (element.seasondate) {
                            element.seasondate.forEach(xx => {
                                seasondates_x.push(xx);
                            });
                        }
                    });

                    var _seasondetails = [];
                    _seasondetails = seasondates_x.filter(t => _cdate_str >= t.startValue && _cdate_str <= t.endValue);
                    _xdates.push({
                        date: cdate,
                        details: {
                            availability: _x_availability,
                            allocation: _x_alloc,
                            blocking: x_blocking,
                            booking: x_book,
                            seasondetails: _seasondetails
                        }
                    });

                });

                rawdata.push({
                    hotel: hotel.hotel,
                    hotelname: hotel.hotelname,
                    goodsCD: hotel.goodsCD,
                    cutOffDays: hotel.cutOffDays,
                    room: _room.room,
                    roomname: _room.name,
                    stockCD: _room.stockCD,
                    numRoom: _room.numRoom,
                    dates: _xdates
                });
            });
        });

        return res.json({ success: true, data: rawdata });
    }).sort({ 'hotelname': 1 });


});

function getAvailability(req, res, next) {
    const [hotelParam,datefrom, dateto, group, agent, hotel, room] = req.params.xparams.split("_");
    var _currentDate = new Date(datefrom);
    var _endDate = new Date(dateto);
    var _currentDateAvailquery = _currentDate.getFullYear() + "-" + ("0" + _currentDate.getMonth()).slice(-2) + "-" + ("0" + _currentDate.getDate()).slice(-2);
    var _currentEndDate = _endDate.getFullYear() + "-" + ("0" + _endDate.getMonth()).slice(-2) + "-" + ("0" + _endDate.getDate()).slice(-2);
    Availability.find(
        {
            "availability.date": {
                $gte: _currentDateAvailquery,
                $lte: _currentEndDate
            }
            // $and: [
            //     {
            //         "availability.date": { $gte: _currentDateAvailquery },
            //         "availability.date": { $lte: _currentEndDate }
            //     }
            // ]
        }, { type: 0, month: 0 }, (error, _availabilityData) => {
            if (error) return res.json({ success: false, error });
            var availability = [];
            if (_availabilityData) {
                _availabilityData.forEach(element => {
                    availability = availability.concat(_removeItemFromArrayAvailability(element.hotel, element.hotelname, element.availability, element.updatedAt, _currentEndDate));
                });
            }
            if (!req.body.inquiry) { req.body.inquiry = [] };
            req.body.inquiry.push(availability);
            next();
            // return res.json({ success: true, data: _availabilityData });
        });
}
function getAllocation(req, res, next) {
    const [hotelParam,datefrom, dateto, group, agent, hotel, room] = req.params.xparams.split("_");
    var _currentDate = new Date(datefrom);
    var _endDate = new Date(dateto);
    var _currentDateAllocquery = _currentDate.getFullYear() + "-" + ("0" + (_currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _currentDate.getDate()).slice(-2);
    var _currentendDateAllocquery = _endDate.getFullYear() + "-" + ("0" + (_endDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _endDate.getDate()).slice(-2);

    Allocation.find(
        {
            // active: true,
            // group: group,
            $and: [
                {
                    $or: [
                        { dateFrom: { $gte: _currentDateAllocquery } },
                        { dateFrom: { $lte: _currentendDateAllocquery } }
                    ]
                },
                {
                    $or: [
                        { dateTo: { $gte: _currentDateAllocquery } },
                        { dateTo: { $lte: _currentendDateAllocquery } }
                    ]
                }

            ]
        }

        , (error, _allocationData) => {
            if (error) return res.json({ success: false, error });

            var _x_allocation = [];
            _allocationData.forEach(allocation => {
                allocation.rooms.forEach(room => {
                    _x_allocation.push({
                        group: allocation.group,
                        hotel: allocation.hotel,
                        hotelname: allocation.hotelname,
                        dateFrom: allocation.dateFrom,
                        dateTo: allocation.dateTo,
                        high_coff: allocation.high_coff,
                        npk_coff: allocation.npk_coff,
                        pk_coff: allocation.pk_coff,
                        room: room.room,
                        roomname: room.roomname,
                        high_qty: room.high,
                        npk_qty: room.npk,
                        pk_qty: room.pk,
                        seasondate: allocation.seasondate,
                        updatedAt: allocation.updatedAt
                    });
                });
            });
            // if (!req.body.inquiry) { req.body.inquiry = [] };
            req.body.inquiry.push(_x_allocation);
            next();
            // return res.json({ success: true, data: _allocationData })

        });
}
function getBlocking(req, res, next) {
    const [hotelParam,datefrom, dateto, group, agent, hotel, room] = req.params.xparams.split("_");
    var _currentDate = new Date(datefrom);
    var _endDate = new Date(dateto);
    var _currentDateAllocquery = _currentDate.getFullYear() + "-" + ("0" + (_currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _currentDate.getDate()).slice(-2);
    var _currentendDateAllocquery = _endDate.getFullYear() + "-" + ("0" + (_endDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _endDate.getDate()).slice(-2);

    Blocking.find({
        //http://www.querymongo.com/
        // group: group,
        agent: agent,
        $or: [
            {
                dateFrom:
                {
                    $gte: _currentDateAllocquery,
                    $lte: _currentendDateAllocquery
                }
            },
            {
                dateTo:
                {
                    $gte: _currentDateAllocquery,
                    $lte: _currentendDateAllocquery
                }

            }
        ]
    }, (error, _blockingData) => {
        if (error) return res.json({ success: false, error });
        req.body.inquiry.push(_blockingData); //_uniqArray(newData);
        next();
        // return res.json({ success: true, data: _blockingData });
    }).count();
}
function getBooking(req, res, next) {
    const [hotelParam,datefrom, dateto, group, agent, hotel, room] = req.params.xparams.split("_");
    var _currentDate = new Date(datefrom);
    var _endDate = new Date(dateto);
    var _currentDateAllocquery = _currentDate.getFullYear() + "-" + ("0" + (_currentDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _currentDate.getDate()).slice(-2);
    var _currentendDateAllocquery = _endDate.getFullYear() + "-" + ("0" + (_endDate.getMonth() + 1)).slice(-2) + "-" + ("0" + _endDate.getDate()).slice(-2);
    Booking.find({
            $or: [
            {
                checkin: {
                    $lte: _currentendDateAllocquery,
                    // $gte: _currentDateAllocquery,
                   }
            },
            {
                checkout: {
                    $gte: _currentDateAllocquery,
                    $lte: _currentendDateAllocquery
                }
            }
        ]
    }, (error, _bookingData) => {
        // console.log(_bookingData.length);
        if (error) return res.json({ success: false, error });
        req.body.inquiry.push(_bookingData);//_uniqArray(newData);
        next();
        // return res.json({ success: true, data: _bookingData })
    }).count();
}
function _removeItemFromArrayAvailability(hotel, hotelname, array, updatedAt, date) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        if (new Date(array[i].date) > new Date(date)) { }
        else {
            newArray.push({
                hotel: hotel,
                hotelname: hotelname,
                date: array[i].date,
                room: array[i].room,
                roomname: array[i].roomname,
                classColor: array[i].classColor,
                status: array[i].status,
                updatedAt: updatedAt

            });
        }
    }
    return newArray;
}
module.exports = router;