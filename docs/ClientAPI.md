# Introduction

This document describes the communication protocol(s) used to manage
interactions between the WARP Desktop Client and the WARP Server.

# General

Communication between the WARP client and the WARP server over a WebSocket
connection at a particular URL. Each message is sent as a single text
frame containing a JSON payload.

## Message Types

Three different message types are referenced in this document:

* __Requests__ are messages sent from the client to the server.
* __Responses__ are messages sent from the server to the client, in
  response to requests.
* __Events__ are messages sent from the server to the client which do not
  have a one-ot-one relationship to a particular request.

### Request Messages

All requests must contain:

* A property named `request`, containing a string indicating the type of
  request.
* A property named `token`, containing a string used to uniquely identify
  requests. It is the client's responsibility to send tokens that are unique
  to that client instance.

### Response Messages

All responses must contain:

* A property named `response`, indicating the type of response. This must
  have the same value as the associated request.
* A property named `token`, containing a string indicating which request
  this response correlates to.

### Events

All events must contain:

* A property named `response`, whose value is a string that ends in
  `"_event"`. This is used to differentiate different kinds of events.

## Time

Timestamps are communicated in two parts:

* Sessions have an epoch time, communicated as an ISO 8601 date
  in the format "YYYY-DDDTHH:MM:SS.sssZ".
* Time stamps for data are given as a numeric offset relative to this epoch;
  this is in units of subseconds (2<sup>-16</sup> seconds).

This representation has certain benefits:

* Avoids the need for string parsing (beyond that handled by conversion from
  JSON) for real-time or historical data; times must be parsed from a string
  for session management tasks, but these are infrequent.
* Easy to compare and perform arithmetic upon, within a given session.
* Provides human-readability in the session management API.

# Requests

The following requests are defined:

Request           | Summary
------------------|----------------------------------------------------
[`ping`](#ping)   | Verify that the server is responsive.


## Ping

A `ping` is a simple request-response pair (useful for verifying connectivity,
et cetera.)

### Request

    {
        "request": "ping"
        "token": "abcXY1"
    }

### Response

    {
        "response": "ping"
        "token": "abcXY1"
    }

## List Sessions

### Request

    {
        "request": "list_sessions",
        "token": "abcXY1",
        "filter": {
            "user": "user_pattern",
            "start": "YYYY-DDDTHH:MM:SS.sssZ",
            "stop": "YYYY-DDDTHH:MM:SS.sssZ",
            ...
        }
    }

### Response

    {
        "response": "list_sessions",
        "token": "abcXY1",
        "sessions": [
            {
                "dbid": "database internal id",
                "id": "globally-unique identifier",
                "name": "human-readable name",
                "epoch": YYYY-DDDTHH:MM:SS.sssZ",
                "start": "YYYY-DDDTHH:MM:SS.sssZ",
                "stop": "YYYY-DDDTHH:MM:SS.sssZ",
                "description": "human-readable description",
                "source": "where the packets are coming or came from, briefly",
                "user": "user name",
                "streaming": boolean,
                "receiving": boolean,
                "in_database": boolean,
                ... and other properties as appropriate ...
            },
            ... and other sessions ...
        ]
    }

Notes

  * `receiving`: Warp Server can't know whether a stream is live or
  not.  It can only know whether it's receiving the packets right
  now, or it's fetching them from it's database.  That's what the
  receiving property is.

  * `streaming`: is this session currently being streamed to some
      receiver. (In the initial implementation, only one session can be
      streamed at a time.  Requests for a second stream will fail.)

  * `in_database`: The server supports sessions that stream through
      the server but aren't stored in the server's database.  If
      in_database=yes, even if it's currently being received, then
      history will be available.

## List Playbacks

Lists available playbacks. A playback is a real-time message stream that
may be referenced in [`subscribe`](#subscribe) requests.

### Request

    {
        "request": "list_playbacks",
        "token": "abcXY1"
    }

### Response

    {
        "response": "list_playbacks",
        "token": "abcXY1",
        "playbacks": [
            {
                "playback_id": number,
                "session_id": number
            }
        ]
    }

## Subscribe

Subscribe to telemetry data associated with specific packets and/or points,
within a given playback.

Packets and/or points must be subscribed-to in order to begin receiving
`data_event` messages associated with those packets/points.

### Request

    {
        "request": "subscribe",
        "token": "abcxyz",
        "playback_id": id
        "ids": [ packet or point ids ]
    }

### Response

    {
        "response": "subscribe",
        "token": "abcxyz",
        "status": "subscribed" or "playback not found" or "not authorized"
        "ids": [ packet or point ids actually subscribed to ]
    }

An invalid playback ID is considered an error when subscribing; invalid
point or packet IDs, however, are ignored (to allow partial success.)
The returned IDs for the actual subscription can be used by the client
to determine what was actually subscribed to.

## Unsubscribe

Subscribe to telemetry data associated with specific packets and/or points,
within a given playback.

Packets and/or points must be subscribed-to in order to begin receiving
`data_event` messages associated with those packets/points.

### Request

    {
        "request": "unsubscribe",
        "token": "abcxyz",
        "playback_id": id
        "ids": [ packet or point ids ]
    }

### Response

    {
        "response": "unsubscribe",
        "token": "abcxyz",
        "status": "unsubscribed" or "playback not found" or "not authorized"
        "ids": [ packet or point ids actually subscribed to ]
    }

## List Packets

List metadata about all packets in the dictionary relevant to a
specific session.

###  Request

    {
        "request": "list_packets",
        "token": "Zxyq1",
        "session": "session_id"
    }

### Response

    {
        "response": "list_packets",
        "token": "Zxyq1",
        "session": "id",
        "packets": [
            {
                "id": "machine-readable identifier",
                "apid": int,
                "name": "human-readable name",
                "description": "human-readable description"
            },
            ... and other packets in this session ...
        ]
    }

## List Points

List metadata about all points in a packet in the dictionary relevant to a
specific session.

### Request

    {
        "request": "list_points",
        "token": "Zxyq1",
        "session": "id",
        "packet": "id"
    }

### Response

    {
        "response": "list_points",
        "token": "Zxyq1",
        "session": "id",
        "packet": "id",
        "apid": int,
        "points": [
            {
                "id": "machine-readable identifier",
                "name": "human-readable name",
                "description": "human-readable description",
                "type": "number" or "string"
            },
            ... and other mnemonics in this packet ...
        ]
    }

# Events

## Data Event

A data event is issued by the server when a new CCSDS packet is received.
These events should only be sent to clients who are currently subscribed to
this packet, or to points within this packet. (See
[`subscribe`](#subscribe) and [`unsubscribe`](#unsubscribe).)

    {
        "response": "data_event",
        "token": "abcXY1",
        "session": "session_id",   // maybe drop this
        "timestamp": integer,
        "apid": int,
        "values": {
            point-id: {
                "value": float or string
                ... optional ...
                "limit_violations": [ "red", ... ]
            }
        }
    }

Notes:

* Supports efficient lookup-by-point-id, which will be common.
* Data type for the "value" field is known by way of looking at
  the point's definition, from list_mnemonics.
* The limit_violations field is optional; if omitted, treat as [].


# Error Handling

Error cases are reflected in status codes defined per-response.

In any off-nominal response or event from the server, an additional
`message` field may be supplied containing a human-readable description of
the error which occurred. The client may utilize this, but should also
be prepared to handle errors in its absence. The rationale for this is
that there may be off-nominal situations where more information is
available to the server than what is expressed in the status codes, and
it may be desirable to convey this information to the user client-side
(at least in the browser's console log.)

(Further definition here may be needed, particularly for how connection
errors are to be handled.)
