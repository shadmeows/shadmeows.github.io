/* APOLO local game engines. Adapted from GameNest (Apache-2.0). */
(function(root){
  var engines={};
  engines.chess=(function(){ var exports={};
﻿/*
 * Copyright (c) 2021, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

var Chess = function (fen) {
  var BLACK = 'b'
  var WHITE = 'w'

  var EMPTY = -1

  var PAWN = 'p'
  var KNIGHT = 'n'
  var BISHOP = 'b'
  var ROOK = 'r'
  var QUEEN = 'q'
  var KING = 'k'

  var SYMBOLS = 'pnbrqkPNBRQK'

  var DEFAULT_POSITION =
    'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

  var TERMINATION_MARKERS = ['1-0', '0-1', '1/2-1/2', '*']

  var PAWN_OFFSETS = {
    b: [16, 32, 17, 15],
    w: [-16, -32, -17, -15],
  }

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14],
    b: [-17, -15, 17, 15],
    r: [-16, 1, 16, -1],
    q: [-17, -16, -15, 1, 17, 16, 15, -1],
    k: [-17, -16, -15, 1, 17, 16, 15, -1],
  }

  // prettier-ignore
  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
    24,24,24,24,24,24,56,  0, 56,24,24,24,24,24,24, 0,
     0, 0, 0, 0, 0, 2,53, 56, 53, 2, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0, 0,20, 2, 24,  2,20, 0, 0, 0, 0, 0, 0,
     0, 0, 0, 0,20, 0, 0, 24,  0, 0,20, 0, 0, 0, 0, 0,
     0, 0, 0,20, 0, 0, 0, 24,  0, 0, 0,20, 0, 0, 0, 0,
     0, 0,20, 0, 0, 0, 0, 24,  0, 0, 0, 0,20, 0, 0, 0,
     0,20, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0,20, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 24,  0, 0, 0, 0, 0, 0,20
  ];

  // prettier-ignore
  var RAYS = [
     17,  0,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0,  0, 15, 0,
      0, 17,  0,  0,  0,  0,  0, 16,  0,  0,  0,  0,  0, 15,  0, 0,
      0,  0, 17,  0,  0,  0,  0, 16,  0,  0,  0,  0, 15,  0,  0, 0,
      0,  0,  0, 17,  0,  0,  0, 16,  0,  0,  0, 15,  0,  0,  0, 0,
      0,  0,  0,  0, 17,  0,  0, 16,  0,  0, 15,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0, 17,  0, 16,  0, 15,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,  0, 17, 16, 15,  0,  0,  0,  0,  0,  0, 0,
      1,  1,  1,  1,  1,  1,  1,  0, -1, -1,  -1,-1, -1, -1, -1, 0,
      0,  0,  0,  0,  0,  0,-15,-16,-17,  0,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,  0,-15,  0,-16,  0,-17,  0,  0,  0,  0,  0, 0,
      0,  0,  0,  0,-15,  0,  0,-16,  0,  0,-17,  0,  0,  0,  0, 0,
      0,  0,  0,-15,  0,  0,  0,-16,  0,  0,  0,-17,  0,  0,  0, 0,
      0,  0,-15,  0,  0,  0,  0,-16,  0,  0,  0,  0,-17,  0,  0, 0,
      0,-15,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,-17,  0, 0,
    -15,  0,  0,  0,  0,  0,  0,-16,  0,  0,  0,  0,  0,  0,-17
  ];

  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 }

  var FLAGS = {
    NORMAL: 'n',
    CAPTURE: 'c',
    BIG_PAWN: 'b',
    EP_CAPTURE: 'e',
    PROMOTION: 'p',
    KSIDE_CASTLE: 'k',
    QSIDE_CASTLE: 'q',
  }

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    EP_CAPTURE: 8,
    PROMOTION: 16,
    KSIDE_CASTLE: 32,
    QSIDE_CASTLE: 64,
  }

  var RANK_1 = 7
  var RANK_2 = 6
  var RANK_3 = 5
  var RANK_4 = 4
  var RANK_5 = 3
  var RANK_6 = 2
  var RANK_7 = 1
  var RANK_8 = 0

  // prettier-ignore
  var SQUARES = {
    a8:   0, b8:   1, c8:   2, d8:   3, e8:   4, f8:   5, g8:   6, h8:   7,
    a7:  16, b7:  17, c7:  18, d7:  19, e7:  20, f7:  21, g7:  22, h7:  23,
    a6:  32, b6:  33, c6:  34, d6:  35, e6:  36, f6:  37, g6:  38, h6:  39,
    a5:  48, b5:  49, c5:  50, d5:  51, e5:  52, f5:  53, g5:  54, h5:  55,
    a4:  64, b4:  65, c4:  66, d4:  67, e4:  68, f4:  69, g4:  70, h4:  71,
    a3:  80, b3:  81, c3:  82, d3:  83, e3:  84, f3:  85, g3:  86, h3:  87,
    a2:  96, b2:  97, c2:  98, d2:  99, e2: 100, f2: 101, g2: 102, h2: 103,
    a1: 112, b1: 113, c1: 114, d1: 115, e1: 116, f1: 117, g1: 118, h1: 119
  };

  var ROOKS = {
    w: [
      { square: SQUARES.a1, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h1, flag: BITS.KSIDE_CASTLE },
    ],
    b: [
      { square: SQUARES.a8, flag: BITS.QSIDE_CASTLE },
      { square: SQUARES.h8, flag: BITS.KSIDE_CASTLE },
    ],
  }

  var board = new Array(128)
  var kings = { w: EMPTY, b: EMPTY }
  var turn = WHITE
  var castling = { w: 0, b: 0 }
  var ep_square = EMPTY
  var half_moves = 0
  var move_number = 1
  var history = []
  var header = {}
  var comments = {}

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === 'undefined') {
    load(DEFAULT_POSITION)
  } else {
    load(fen)
  }

  function clear(keep_headers) {
    if (typeof keep_headers === 'undefined') {
      keep_headers = false
    }

    board = new Array(128)
    kings = { w: EMPTY, b: EMPTY }
    turn = WHITE
    castling = { w: 0, b: 0 }
    ep_square = EMPTY
    half_moves = 0
    move_number = 1
    history = []
    if (!keep_headers) header = {}
    comments = {}
    update_setup(generate_fen())
  }

  function prune_comments() {
    var reversed_history = []
    var current_comments = {}
    var copy_comment = function (fen) {
      if (fen in comments) {
        current_comments[fen] = comments[fen]
      }
    }
    while (history.length > 0) {
      reversed_history.push(undo_move())
    }
    copy_comment(generate_fen())
    while (reversed_history.length > 0) {
      make_move(reversed_history.pop())
      copy_comment(generate_fen())
    }
    comments = current_comments
  }

  function reset() {
    load(DEFAULT_POSITION)
  }

  function load(fen, keep_headers) {
    if (typeof keep_headers === 'undefined') {
      keep_headers = false
    }

    var tokens = fen.split(/\s+/)
    var position = tokens[0]
    var square = 0

    if (!validate_fen(fen).valid) {
      return false
    }

    clear(keep_headers)

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i)

      if (piece === '/') {
        square += 8
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10)
      } else {
        var color = piece < 'a' ? WHITE : BLACK
        put({ type: piece.toLowerCase(), color: color }, algebraic(square))
        square++
      }
    }

    turn = tokens[1]

    if (tokens[2].indexOf('K') > -1) {
      castling.w |= BITS.KSIDE_CASTLE
    }
    if (tokens[2].indexOf('Q') > -1) {
      castling.w |= BITS.QSIDE_CASTLE
    }
    if (tokens[2].indexOf('k') > -1) {
      castling.b |= BITS.KSIDE_CASTLE
    }
    if (tokens[2].indexOf('q') > -1) {
      castling.b |= BITS.QSIDE_CASTLE
    }

    ep_square = tokens[3] === '-' ? EMPTY : SQUARES[tokens[3]]
    half_moves = parseInt(tokens[4], 10)
    move_number = parseInt(tokens[5], 10)

    update_setup(generate_fen())

    return true
  }

  /* TODO: this function is pretty much crap - it validates structure but
   * completely ignores content (e.g. doesn't verify that each side has a king)
   * ... we should rewrite this, and ditch the silly error_number field while
   * we're at it
   */
  function validate_fen(fen) {
    var errors = {
      0: 'No errors.',
      1: 'FEN string must contain six space-delimited fields.',
      2: '6th field (move number) must be a positive integer.',
      3: '5th field (half move counter) must be a non-negative integer.',
      4: '4th field (en-passant square) is invalid.',
      5: '3rd field (castling availability) is invalid.',
      6: '2nd field (side to move) is invalid.',
      7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
      8: '1st field (piece positions) is invalid [consecutive numbers].',
      9: '1st field (piece positions) is invalid [invalid piece].',
      10: '1st field (piece positions) is invalid [row too large].',
      11: 'Illegal en-passant square',
    }

    /* 1st criterion: 6 space-seperated fields? */
    var tokens = fen.split(/\s+/)
    if (tokens.length !== 6) {
      return { valid: false, error_number: 1, error: errors[1] }
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[5]) || parseInt(tokens[5], 10) <= 0) {
      return { valid: false, error_number: 2, error: errors[2] }
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[4]) || parseInt(tokens[4], 10) < 0) {
      return { valid: false, error_number: 3, error: errors[3] }
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    if (!/^(-|[abcdefgh][36])$/.test(tokens[3])) {
      return { valid: false, error_number: 4, error: errors[4] }
    }

    /* 5th criterion: 3th field is a valid castle-string? */
    if (!/^(KQ?k?q?|Qk?q?|kq?|q|-)$/.test(tokens[2])) {
      return { valid: false, error_number: 5, error: errors[5] }
    }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      return { valid: false, error_number: 6, error: errors[6] }
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split('/')
    if (rows.length !== 8) {
      return { valid: false, error_number: 7, error: errors[7] }
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0
      var previous_was_number = false

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            return { valid: false, error_number: 8, error: errors[8] }
          }
          sum_fields += parseInt(rows[i][k], 10)
          previous_was_number = true
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            return { valid: false, error_number: 9, error: errors[9] }
          }
          sum_fields += 1
          previous_was_number = false
        }
      }
      if (sum_fields !== 8) {
        return { valid: false, error_number: 10, error: errors[10] }
      }
    }

    if (
      (tokens[3][1] == '3' && tokens[1] == 'w') ||
      (tokens[3][1] == '6' && tokens[1] == 'b')
    ) {
      return { valid: false, error_number: 11, error: errors[11] }
    }

    /* everything's okay! */
    return { valid: true, error_number: 0, error: errors[0] }
  }

  function generate_fen() {
    var empty = 0
    var fen = ''

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      if (board[i] == null) {
        empty++
      } else {
        if (empty > 0) {
          fen += empty
          empty = 0
        }
        var color = board[i].color
        var piece = board[i].type

        fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
      }

      if ((i + 1) & 0x88) {
        if (empty > 0) {
          fen += empty
        }

        if (i !== SQUARES.h1) {
          fen += '/'
        }

        empty = 0
        i += 8
      }
    }

    var cflags = ''
    if (castling[WHITE] & BITS.KSIDE_CASTLE) {
      cflags += 'K'
    }
    if (castling[WHITE] & BITS.QSIDE_CASTLE) {
      cflags += 'Q'
    }
    if (castling[BLACK] & BITS.KSIDE_CASTLE) {
      cflags += 'k'
    }
    if (castling[BLACK] & BITS.QSIDE_CASTLE) {
      cflags += 'q'
    }

    /* do we have an empty castling flag? */
    cflags = cflags || '-'
    var epflags = ep_square === EMPTY ? '-' : algebraic(ep_square)

    return [fen, turn, cflags, epflags, half_moves, move_number].join(' ')
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === 'string' && typeof args[i + 1] === 'string') {
        header[args[i]] = args[i + 1]
      }
    }
    return header
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    if (history.length > 0) return

    if (fen !== DEFAULT_POSITION) {
      header['SetUp'] = '1'
      header['FEN'] = fen
    } else {
      delete header['SetUp']
      delete header['FEN']
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]]
    return piece ? { type: piece.type, color: piece.color } : null
  }

  function put(piece, square) {
    /* check for valid piece object */
    if (!('type' in piece && 'color' in piece)) {
      return false
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      return false
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      return false
    }

    var sq = SQUARES[square]

    /* don't let the user place more than one king */
    if (
      piece.type == KING &&
      !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
    ) {
      return false
    }

    board[sq] = { type: piece.type, color: piece.color }
    if (piece.type === KING) {
      kings[piece.color] = sq
    }

    update_setup(generate_fen())

    return true
  }

  function remove(square) {
    var piece = get(square)
    board[SQUARES[square]] = null
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY
    }

    update_setup(generate_fen())

    return piece
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type,
    }

    if (promotion) {
      move.flags |= BITS.PROMOTION
      move.promotion = promotion
    }

    if (board[to]) {
      move.captured = board[to].type
    } else if (flags & BITS.EP_CAPTURE) {
      move.captured = PAWN
    }
    return move
  }

  function generate_moves(options) {
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (
        board[from].type === PAWN &&
        (rank(to) === RANK_8 || rank(to) === RANK_1)
      ) {
        var pieces = [QUEEN, ROOK, BISHOP, KNIGHT]
        for (var i = 0, len = pieces.length; i < len; i++) {
          moves.push(build_move(board, from, to, flags, pieces[i]))
        }
      } else {
        moves.push(build_move(board, from, to, flags))
      }
    }

    var moves = []
    var us = turn
    var them = swap_color(us)
    var second_rank = { b: RANK_7, w: RANK_2 }

    var first_sq = SQUARES.a8
    var last_sq = SQUARES.h1
    var single_square = false

    /* do we want legal moves? */
    var legal =
      typeof options !== 'undefined' && 'legal' in options
        ? options.legal
        : true

    var piece_type =
      typeof options !== 'undefined' &&
      'piece' in options &&
      typeof options.piece === 'string'
        ? options.piece.toLowerCase()
        : true

    /* are we generating moves for a single square? */
    if (typeof options !== 'undefined' && 'square' in options) {
      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square]
        single_square = true
      } else {
        /* invalid square */
        return []
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 7
        continue
      }

      var piece = board[i]
      if (piece == null || piece.color !== us) {
        continue
      }

      if (piece.type === PAWN && (piece_type === true || piece_type === PAWN)) {
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0]
        if (board[square] == null) {
          add_move(board, moves, i, square, BITS.NORMAL)

          /* double square */
          var square = i + PAWN_OFFSETS[us][1]
          if (second_rank[us] === rank(i) && board[square] == null) {
            add_move(board, moves, i, square, BITS.BIG_PAWN)
          }
        }

        /* pawn captures */
        for (j = 2; j < 4; j++) {
          var square = i + PAWN_OFFSETS[us][j]
          if (square & 0x88) continue

          if (board[square] != null && board[square].color === them) {
            add_move(board, moves, i, square, BITS.CAPTURE)
          } else if (square === ep_square) {
            add_move(board, moves, i, ep_square, BITS.EP_CAPTURE)
          }
        }
      } else if (piece_type === true || piece_type === piece.type) {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j]
          var square = i

          while (true) {
            square += offset
            if (square & 0x88) break

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL)
            } else {
              if (board[square].color === us) break
              add_move(board, moves, i, square, BITS.CAPTURE)
              break
            }

            /* break, if knight or king */
            if (piece.type === 'n' || piece.type === 'k') break
          }
        }
      }
    }

    /* check for castling if: a) we're generating all moves, or b) we're doing
     * single square move generation on the king's square
     */
    if (piece_type === true || piece_type === KING) {
      if (!single_square || last_sq === kings[us]) {
        /* king-side castling */
        if (castling[us] & BITS.KSIDE_CASTLE) {
          var castling_from = kings[us]
          var castling_to = castling_from + 2

          if (
            board[castling_from + 1] == null &&
            board[castling_to] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from + 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.KSIDE_CASTLE)
          }
        }

        /* queen-side castling */
        if (castling[us] & BITS.QSIDE_CASTLE) {
          var castling_from = kings[us]
          var castling_to = castling_from - 2

          if (
            board[castling_from - 1] == null &&
            board[castling_from - 2] == null &&
            board[castling_from - 3] == null &&
            !attacked(them, kings[us]) &&
            !attacked(them, castling_from - 1) &&
            !attacked(them, castling_to)
          ) {
            add_move(board, moves, kings[us], castling_to, BITS.QSIDE_CASTLE)
          }
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      return moves
    }

    /* filter out illegal moves */
    var legal_moves = []
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i])
      if (!king_attacked(us)) {
        legal_moves.push(moves[i])
      }
      undo_move()
    }

    return legal_moves
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} sloppy Use the sloppy SAN generator to work around over
   * disambiguation bugs in Fritz and Chessbase.  See below:
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */
  function move_to_san(move, moves) {
    var output = ''

    if (move.flags & BITS.KSIDE_CASTLE) {
      output = 'O-O'
    } else if (move.flags & BITS.QSIDE_CASTLE) {
      output = 'O-O-O'
    } else {
      if (move.piece !== PAWN) {
        var disambiguator = get_disambiguator(move, moves)
        output += move.piece.toUpperCase() + disambiguator
      }

      if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
        if (move.piece === PAWN) {
          output += algebraic(move.from)[0]
        }
        output += 'x'
      }

      output += algebraic(move.to)

      if (move.flags & BITS.PROMOTION) {
        output += '=' + move.promotion.toUpperCase()
      }
    }

    make_move(move)
    if (in_check()) {
      if (in_checkmate()) {
        output += '#'
      } else {
        output += '+'
      }
    }
    undo_move()

    return output
  }
  // parses all of the decorators out of a SAN string
  function stripped_san(move) {
    return move.replace(/=/, '').replace(/[+#]?[?!]*$/, '')
  }

  function attacked(color, square) {
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 7
        continue
      }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue

      var piece = board[i]
      var difference = i - square
      var index = difference + 119

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true
          } else {
            if (piece.color === BLACK) return true
          }
          continue
        }

        /* if the piece is a knight or a king */
        if (piece.type === 'n' || piece.type === 'k') return true

        var offset = RAYS[index]
        var j = i + offset

        var blocked = false
        while (j !== square) {
          if (board[j] != null) {
            blocked = true
            break
          }
          j += offset
        }

        if (!blocked) return true
      }
    }

    return false
  }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color])
  }

  function in_check() {
    return king_attacked(turn)
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0
  }

  function insufficient_material() {
    var pieces = {}
    var bishops = []
    var num_pieces = 0
    var sq_color = 0

    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      sq_color = (sq_color + 1) % 2
      if (i & 0x88) {
        i += 7
        continue
      }

      var piece = board[i]
      if (piece) {
        pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1
        if (piece.type === BISHOP) {
          bishops.push(sq_color)
        }
        num_pieces++
      }
    }

    /* k vs. k */
    if (num_pieces === 2) {
      return true
    } else if (
      /* k vs. kn .... or .... k vs. kb */
      num_pieces === 3 &&
      (pieces[BISHOP] === 1 || pieces[KNIGHT] === 1)
    ) {
      return true
    } else if (num_pieces === pieces[BISHOP] + 2) {
      /* kb vs. kb where any number of bishops are all on the same color */
      var sum = 0
      var len = bishops.length
      for (var i = 0; i < len; i++) {
        sum += bishops[i]
      }
      if (sum === 0 || sum === len) {
        return true
      }
    }

    return false
  }

  function in_threefold_repetition() {
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = []
    var positions = {}
    var repetition = false

    while (true) {
      var move = undo_move()
      if (!move) break
      moves.push(move)
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      var fen = generate_fen().split(' ').slice(0, 4).join(' ')

      /* has the position occurred three or move times */
      positions[fen] = fen in positions ? positions[fen] + 1 : 1
      if (positions[fen] >= 3) {
        repetition = true
      }

      if (!moves.length) {
        break
      }
      make_move(moves.pop())
    }

    return repetition
  }

  function push(move) {
    history.push({
      move: move,
      kings: { b: kings.b, w: kings.w },
      turn: turn,
      castling: { b: castling.b, w: castling.w },
      ep_square: ep_square,
      half_moves: half_moves,
      move_number: move_number,
    })
  }

  function make_move(move) {
    var us = turn
    var them = swap_color(us)
    push(move)

    board[move.to] = board[move.from]
    board[move.from] = null

    /* if ep capture, remove the captured pawn */
    if (move.flags & BITS.EP_CAPTURE) {
      if (turn === BLACK) {
        board[move.to - 16] = null
      } else {
        board[move.to + 16] = null
      }
    }

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = { type: move.promotion, color: us }
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to

      /* if we castled, move the rook next to the king */
      if (move.flags & BITS.KSIDE_CASTLE) {
        var castling_to = move.to - 1
        var castling_from = move.to + 1
        board[castling_to] = board[castling_from]
        board[castling_from] = null
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        var castling_to = move.to + 1
        var castling_from = move.to - 2
        board[castling_to] = board[castling_from]
        board[castling_from] = null
      }

      /* turn off castling */
      castling[us] = ''
    }

    /* turn off castling if we move a rook */
    if (castling[us]) {
      for (var i = 0, len = ROOKS[us].length; i < len; i++) {
        if (
          move.from === ROOKS[us][i].square &&
          castling[us] & ROOKS[us][i].flag
        ) {
          castling[us] ^= ROOKS[us][i].flag
          break
        }
      }
    }

    /* turn off castling if we capture a rook */
    if (castling[them]) {
      for (var i = 0, len = ROOKS[them].length; i < len; i++) {
        if (
          move.to === ROOKS[them][i].square &&
          castling[them] & ROOKS[them][i].flag
        ) {
          castling[them] ^= ROOKS[them][i].flag
          break
        }
      }
    }

    /* if big pawn move, update the en passant square */
    if (move.flags & BITS.BIG_PAWN) {
      if (turn === 'b') {
        ep_square = move.to - 16
      } else {
        ep_square = move.to + 16
      }
    } else {
      ep_square = EMPTY
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0
    } else if (move.flags & (BITS.CAPTURE | BITS.EP_CAPTURE)) {
      half_moves = 0
    } else {
      half_moves++
    }

    if (turn === BLACK) {
      move_number++
    }
    turn = swap_color(turn)
  }

  function undo_move() {
    var old = history.pop()
    if (old == null) {
      return null
    }

    var move = old.move
    kings = old.kings
    turn = old.turn
    castling = old.castling
    ep_square = old.ep_square
    half_moves = old.half_moves
    move_number = old.move_number

    var us = turn
    var them = swap_color(turn)

    board[move.from] = board[move.to]
    board[move.from].type = move.piece // to undo any promotions
    board[move.to] = null

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = { type: move.captured, color: them }
    } else if (move.flags & BITS.EP_CAPTURE) {
      var index
      if (us === BLACK) {
        index = move.to - 16
      } else {
        index = move.to + 16
      }
      board[index] = { type: PAWN, color: them }
    }

    if (move.flags & (BITS.KSIDE_CASTLE | BITS.QSIDE_CASTLE)) {
      var castling_to, castling_from
      if (move.flags & BITS.KSIDE_CASTLE) {
        castling_to = move.to + 1
        castling_from = move.to - 1
      } else if (move.flags & BITS.QSIDE_CASTLE) {
        castling_to = move.to - 2
        castling_from = move.to + 1
      }

      board[castling_to] = board[castling_from]
      board[castling_from] = null
    }

    return move
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move, moves) {
    var from = move.from
    var to = move.to
    var piece = move.piece

    var ambiguities = 0
    var same_rank = 0
    var same_file = 0

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from
      var ambig_to = moves[i].to
      var ambig_piece = moves[i].piece

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++

        if (rank(from) === rank(ambig_from)) {
          same_rank++
        }

        if (file(from) === file(ambig_from)) {
          same_file++
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from)
      } else if (same_file > 0) {
        /* if the moving piece rests on the same file, use the rank symbol as the
         * disambiguator
         */
        return algebraic(from).charAt(1)
      } else {
        /* else use the file symbol */
        return algebraic(from).charAt(0)
      }
    }

    return ''
  }

  function infer_piece_type(san) {
    var piece_type = san.charAt(0)
    if (piece_type >= 'a' && piece_type <= 'h') {
      var matches = san.match(/[a-h]\d.*[a-h]\d/)
      if (matches) {
        return undefined
      }
      return PAWN
    }
    piece_type = piece_type.toLowerCase()
    if (piece_type === 'o') {
      return KING
    }
    return piece_type
  }
  function ascii() {
    var s = '   +------------------------+\n'
    for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += ' ' + '87654321'[rank(i)] + ' |'
      }

      /* empty piece */
      if (board[i] == null) {
        s += ' . '
      } else {
        var piece = board[i].type
        var color = board[i].color
        var symbol = color === WHITE ? piece.toUpperCase() : piece.toLowerCase()
        s += ' ' + symbol + ' '
      }

      if ((i + 1) & 0x88) {
        s += '|\n'
        i += 8
      }
    }
    s += '   +------------------------+\n'
    s += '     a  b  c  d  e  f  g  h\n'

    return s
  }

  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  function move_from_san(move, sloppy) {
    // strip off any move decorations: e.g Nf3+?! becomes Nf3
    var clean_move = stripped_san(move)

    var overly_disambiguated = false

    if (sloppy) {
      // The sloppy parser allows the user to parse non-standard chess
      // notations. This parser is opt-in (by specifying the
      // '{ sloppy: true }' setting) and is only run after the Standard
      // Algebraic Notation (SAN) parser has failed.
      //
      // When running the sloppy parser, we'll run a regex to grab the piece,
      // the to/from square, and an optional promotion piece. This regex will
      // parse common non-standard notation like: Pe2-e4, Rc1c4, Qf3xf7, f7f8q,
      // b1c3

      // NOTE: Some positions and moves may be ambiguous when using the sloppy
      // parser. For example, in this position: 6k1/8/8/B7/8/8/8/BN4K1 w - - 0 1,
      // the move b1c3 may be interpreted as Nc3 or B1c3 (a disambiguated
      // bishop move). In these cases, the sloppy parser will default to the
      // most most basic interpretation - b1c3 parses to Nc3.

      var matches = clean_move.match(
        /([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/
      )
      if (matches) {
        var piece = matches[1]
        var from = matches[2]
        var to = matches[3]
        var promotion = matches[4]

        if (from.length == 1) {
          overly_disambiguated = true
        }
      } else {
        // The [a-h]?[1-8]? portion of the regex below handles moves that may
        // be overly disambiguated (e.g. Nge7 is unnecessary and non-standard
        // when there is one legal knight move to e7). In this case, the value
        // of 'from' variable will be a rank or file, not a square.
        var matches = clean_move.match(
          /([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/
        )

        if (matches) {
          var piece = matches[1]
          var from = matches[2]
          var to = matches[3]
          var promotion = matches[4]

          if (from.length == 1) {
            var overly_disambiguated = true
          }
        }
      }
    }

    var piece_type = infer_piece_type(clean_move)
    var moves = generate_moves({
      legal: true,
      piece: piece ? piece : piece_type,
    })

    for (var i = 0, len = moves.length; i < len; i++) {
      // try the strict parser first, then the sloppy parser if requested
      // by the user
      if (clean_move === stripped_san(move_to_san(moves[i], moves))) {
        return moves[i]
      } else {
        if (sloppy && matches) {
          // hand-compare move properties with the results from our sloppy
          // regex
          if (
            (!piece || piece.toLowerCase() == moves[i].piece) &&
            SQUARES[from] == moves[i].from &&
            SQUARES[to] == moves[i].to &&
            (!promotion || promotion.toLowerCase() == moves[i].promotion)
          ) {
            return moves[i]
          } else if (overly_disambiguated) {
            // SPECIAL CASE: we parsed a move string that may have an unneeded
            // rank/file disambiguator (e.g. Nge7).  The 'from' variable will
            var square = algebraic(moves[i].from)
            if (
              (!piece || piece.toLowerCase() == moves[i].piece) &&
              SQUARES[to] == moves[i].to &&
              (from == square[0] || from == square[1]) &&
              (!promotion || promotion.toLowerCase() == moves[i].promotion)
            ) {
              return moves[i]
            }
          }
        }
      }
    }

    return null
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  function rank(i) {
    return i >> 4
  }

  function file(i) {
    return i & 15
  }

  function algebraic(i) {
    var f = file(i),
      r = rank(i)
    return 'abcdefgh'.substring(f, f + 1) + '87654321'.substring(r, r + 1)
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE
  }

  function is_digit(c) {
    return '0123456789'.indexOf(c) !== -1
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move)
    move.san = move_to_san(move, generate_moves({ legal: true }))
    move.to = algebraic(move.to)
    move.from = algebraic(move.from)

    var flags = ''

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag]
      }
    }
    move.flags = flags

    return move
  }

  function clone(obj) {
    var dupe = obj instanceof Array ? [] : {}

    for (var property in obj) {
      if (typeof property === 'object') {
        dupe[property] = clone(obj[property])
      } else {
        dupe[property] = obj[property]
      }
    }

    return dupe
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '')
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  function perft(depth) {
    var moves = generate_moves({ legal: false })
    var nodes = 0
    var color = turn

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i])
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1)
          nodes += child_nodes
        } else {
          nodes++
        }
      }
      undo_move()
    }

    return nodes
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    BISHOP: BISHOP,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: (function () {
      /* from the ECMA-262 spec (section 12.6.4):
       * "The mechanics of enumerating the properties ... is
       * implementation dependent"
       * so: for (var sq in SQUARES) { keys.push(sq); } might not be
       * ordered correctly
       */
      var keys = []
      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (i & 0x88) {
          i += 7
          continue
        }
        keys.push(algebraic(i))
      }
      return keys
    })(),
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function (fen) {
      return load(fen)
    },

    reset: function () {
      return reset()
    },

    moves: function (options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options)
      var moves = []

      for (var i = 0, len = ugly_moves.length; i < len; i++) {
        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (
          typeof options !== 'undefined' &&
          'verbose' in options &&
          options.verbose
        ) {
          moves.push(make_pretty(ugly_moves[i]))
        } else {
          moves.push(
            move_to_san(ugly_moves[i], generate_moves({ legal: true }))
          )
        }
      }

      return moves
    },

    in_check: function () {
      return in_check()
    },

    in_checkmate: function () {
      return in_checkmate()
    },

    in_stalemate: function () {
      return in_stalemate()
    },

    in_draw: function () {
      return (
        half_moves >= 100 ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      )
    },

    insufficient_material: function () {
      return insufficient_material()
    },

    in_threefold_repetition: function () {
      return in_threefold_repetition()
    },

    game_over: function () {
      return (
        half_moves >= 100 ||
        in_checkmate() ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      )
    },

    validate_fen: function (fen) {
      return validate_fen(fen)
    },

    fen: function () {
      return generate_fen()
    },

    board: function () {
      var output = [],
        row = []

      for (var i = SQUARES.a8; i <= SQUARES.h1; i++) {
        if (board[i] == null) {
          row.push(null)
        } else {
          row.push({ type: board[i].type, color: board[i].color })
        }
        if ((i + 1) & 0x88) {
          output.push(row)
          row = []
          i += 8
        }
      }

      return output
    },

    pgn: function (options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline =
        typeof options === 'object' && typeof options.newline_char === 'string'
          ? options.newline_char
          : '\n'
      var max_width =
        typeof options === 'object' && typeof options.max_width === 'number'
          ? options.max_width
          : 0
      var result = []
      var header_exists = false

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push('[' + i + ' "' + header[i] + '"]' + newline)
        header_exists = true
      }

      if (header_exists && history.length) {
        result.push(newline)
      }

      var append_comment = function (move_string) {
        var comment = comments[generate_fen()]
        if (typeof comment !== 'undefined') {
          var delimiter = move_string.length > 0 ? ' ' : ''
          move_string = `${move_string}${delimiter}{${comment}}`
        }
        return move_string
      }

      /* pop all of history onto reversed_history */
      var reversed_history = []
      while (history.length > 0) {
        reversed_history.push(undo_move())
      }

      var moves = []
      var move_string = ''

      /* special case of a commented starting position with no moves */
      if (reversed_history.length === 0) {
        moves.push(append_comment(''))
      }

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        move_string = append_comment(move_string)
        var move = reversed_history.pop()

        /* if the position started with black to move, start PGN with 1. ... */
        if (!history.length && move.color === 'b') {
          move_string = move_number + '. ...'
        } else if (move.color === 'w') {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string)
          }
          move_string = move_number + '.'
        }

        move_string =
          move_string + ' ' + move_to_san(move, generate_moves({ legal: true }))
        make_move(move)
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(append_comment(move_string))
      }

      /* is there a result? */
      if (typeof header.Result !== 'undefined') {
        moves.push(header.Result)
      }

      /* history should be back to what it was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join('') + moves.join(' ')
      }

      var strip = function () {
        if (result.length > 0 && result[result.length - 1] === ' ') {
          result.pop()
          return true
        }
        return false
      }

      /* NB: this does not preserve comment whitespace. */
      var wrap_comment = function (width, move) {
        for (var token of move.split(' ')) {
          if (!token) {
            continue
          }
          if (width + token.length > max_width) {
            while (strip()) {
              width--
            }
            result.push(newline)
            width = 0
          }
          result.push(token)
          width += token.length
          result.push(' ')
          width++
        }
        if (strip()) {
          width--
        }
        return width
      }

      /* wrap the PGN output at max_width */
      var current_width = 0
      for (var i = 0; i < moves.length; i++) {
        if (current_width + moves[i].length > max_width) {
          if (moves[i].includes('{')) {
            current_width = wrap_comment(current_width, moves[i])
            continue
          }
        }
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {
          /* don't end the line with whitespace */
          if (result[result.length - 1] === ' ') {
            result.pop()
          }

          result.push(newline)
          current_width = 0
        } else if (i !== 0) {
          result.push(' ')
          current_width++
        }
        result.push(moves[i])
        current_width += moves[i].length
      }

      return result.join('')
    },

    load_pgn: function (pgn, options) {
      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== 'undefined' && 'sloppy' in options
          ? options.sloppy
          : false

      function mask(str) {
        return str.replace(/\\/g, '\\')
      }

      function has_keys(object) {
        for (var key in object) {
          return true
        }
        return false
      }

      function parse_pgn_header(header, options) {
        var newline_char =
          typeof options === 'object' &&
          typeof options.newline_char === 'string'
            ? options.newline_char
            : '\r?\n'
        var header_obj = {}
        var headers = header.split(new RegExp(mask(newline_char)))
        var key = ''
        var value = ''

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, '$1')
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\ *\]$/, '$1')
          if (trim(key).length > 0) {
            header_obj[key] = value
          }
        }

        return header_obj
      }

      var newline_char =
        typeof options === 'object' && typeof options.newline_char === 'string'
          ? options.newline_char
          : '\r?\n'

      // RegExp to split header. Takes advantage of the fact that header and movetext
      // will always have a blank line between them (ie, two newline_char's).
      // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\r?\n){2}/
      var header_regex = new RegExp(
        '^(\\[((?:' +
          mask(newline_char) +
          ')|.)*\\])' +
          '(?:' +
          mask(newline_char) +
          '){2}'
      )

      // If no header given, begin with moves.
      var header_string = header_regex.test(pgn)
        ? header_regex.exec(pgn)[1]
        : ''

      // Put the board in the starting position
      reset()

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options)
      for (var key in headers) {
        set_header([key, headers[key]])
      }

      /* load the starting position indicated by [Setup '1'] and
       * [FEN position] */
      if (headers['SetUp'] === '1') {
        if (!('FEN' in headers && load(headers['FEN'], true))) {
          // second argument to load: don't clear the headers
          return false
        }
      }

      /* NB: the regexes below that delete move numbers, recursive
       * annotations, and numeric annotation glyphs may also match
       * text in comments. To prevent this, we transform comments
       * by hex-encoding them in place and decoding them again after
       * the other tokens have been deleted.
       *
       * While the spec states that PGN files should be ASCII encoded,
       * we use {en,de}codeURIComponent here to support arbitrary UTF8
       * as a convenience for modern users */

      var to_hex = function (string) {
        return Array.from(string)
          .map(function (c) {
            /* encodeURI doesn't transform most ASCII characters,
             * so we handle these ourselves */
            return c.charCodeAt(0) < 128
              ? c.charCodeAt(0).toString(16)
              : encodeURIComponent(c).replace(/\%/g, '').toLowerCase()
          })
          .join('')
      }

      var from_hex = function (string) {
        return string.length == 0
          ? ''
          : decodeURIComponent('%' + string.match(/.{1,2}/g).join('%'))
      }

      var encode_comment = function (string) {
        string = string.replace(new RegExp(mask(newline_char), 'g'), ' ')
        return `{${to_hex(string.slice(1, string.length - 1))}}`
      }

      var decode_comment = function (string) {
        if (string.startsWith('{') && string.endsWith('}')) {
          return from_hex(string.slice(1, string.length - 1))
        }
      }

      /* delete header to get the moves */
      var ms = pgn
        .replace(header_string, '')
        .replace(
          /* encode comments so they don't get deleted below */
          new RegExp(`(\{[^}]*\})+?|;([^${mask(newline_char)}]*)`, 'g'),
          function (match, bracket, semicolon) {
            return bracket !== undefined
              ? encode_comment(bracket)
              : ' ' + encode_comment(`{${semicolon.slice(1)}}`)
          }
        )
        .replace(new RegExp(mask(newline_char), 'g'), ' ')

      /* delete recursive annotation variations */
      var rav_regex = /(\([^\(\)]+\))+?/g
      while (rav_regex.test(ms)) {
        ms = ms.replace(rav_regex, '')
      }

      /* delete move numbers */
      ms = ms.replace(/\d+\.(\.\.)?/g, '')

      /* delete ... indicating black to move */
      ms = ms.replace(/\.\.\./g, '')

      /* delete numeric annotation glyphs */
      ms = ms.replace(/\$\d+/g, '')

      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/))

      /* delete empty entries */
      moves = moves.join(',').replace(/,,+/g, ',').split(',')
      var move = ''

      var result = ''

      for (var half_move = 0; half_move < moves.length; half_move++) {
        var comment = decode_comment(moves[half_move])
        if (comment !== undefined) {
          comments[generate_fen()] = comment
          continue
        }

        move = move_from_san(moves[half_move], sloppy)

        /* invalid move */
        if (move == null) {
          /* was the move an end of game marker */
          if (TERMINATION_MARKERS.indexOf(moves[half_move]) > -1) {
            result = moves[half_move]
          } else {
            return false
          }
        } else {
          /* reset the end of game marker if making a valid move */
          result = ''
          make_move(move)
        }
      }

      /* Per section 8.2.6 of the PGN spec, the Result tag pair must match
       * match the termination marker. Only do this when headers are present,
       * but the result tag is missing
       */
      if (result && Object.keys(header).length && !header['Result']) {
        set_header(['Result', result])
      }

      return true
    },

    header: function () {
      return set_header(arguments)
    },

    ascii: function () {
      return ascii()
    },

    turn: function () {
      return turn
    },

    move: function (move, options) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'h8',      fields are ignored)
       *         promotion: 'q',
       *      })
       */

      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== 'undefined' && 'sloppy' in options
          ? options.sloppy
          : false

      var move_obj = null

      if (typeof move === 'string') {
        move_obj = move_from_san(move, sloppy)
      } else if (typeof move === 'object') {
        var moves = generate_moves()

        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (
            move.from === algebraic(moves[i].from) &&
            move.to === algebraic(moves[i].to) &&
            (!('promotion' in moves[i]) ||
              move.promotion === moves[i].promotion)
          ) {
            move_obj = moves[i]
            break
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj)

      make_move(move_obj)

      return pretty_move
    },

    undo: function () {
      var move = undo_move()
      return move ? make_pretty(move) : null
    },

    clear: function () {
      return clear()
    },

    put: function (piece, square) {
      return put(piece, square)
    },

    get: function (square) {
      return get(square)
    },

    remove: function (square) {
      return remove(square)
    },

    perft: function (depth) {
      return perft(depth)
    },

    square_color: function (square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square]
        return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? 'light' : 'dark'
      }

      return null
    },

    history: function (options) {
      var reversed_history = []
      var move_history = []
      var verbose =
        typeof options !== 'undefined' &&
        'verbose' in options &&
        options.verbose

      while (history.length > 0) {
        reversed_history.push(undo_move())
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop()
        if (verbose) {
          move_history.push(make_pretty(move))
        } else {
          move_history.push(move_to_san(move, generate_moves({ legal: true })))
        }
        make_move(move)
      }

      return move_history
    },

    get_comment: function () {
      return comments[generate_fen()]
    },

    set_comment: function (comment) {
      comments[generate_fen()] = comment.replace('{', '[').replace('}', ']')
    },

    delete_comment: function () {
      var comment = comments[generate_fen()]
      delete comments[generate_fen()]
      return comment
    },

    get_comments: function () {
      prune_comments()
      return Object.keys(comments).map(function (fen) {
        return { fen: fen, comment: comments[fen] }
      })
    },

    delete_comments: function () {
      prune_comments()
      return Object.keys(comments).map(function (fen) {
        var comment = comments[fen]
        delete comments[fen]
        return { fen: fen, comment: comment }
      })
    },
  }
}

/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== 'undefined') exports.Chess = Chess
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== 'undefined')
  define(function () {
    return Chess
  })


    return exports.Chess || null; })();
  engines.uno=(function(){ var exports={};
    var require=function(name){ if(name==='./lib/hidden') return {maskView:function(state){return JSON.parse(JSON.stringify(state));}}; throw new Error('Unsupported UNO dependency: '+name); };
// games/uno.js
// UNO - 2-4 player card game with color/number matching and action cards

const COLORS = ['red', 'blue', 'green', 'yellow'];

exports.name = 'uno';
exports.maxPlayers = 6;

function createDeck() {
  const deck = [];
  for (const c of COLORS) {
    deck.push({ color: c, value: '0', id: c + '-0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ color: c, value: String(i), id: c + '-' + i + '-a' });
      deck.push({ color: c, value: String(i), id: c + '-' + i + '-b' });
    }
    deck.push({ color: c, value: 'skip', id: c + '-skip-a' });
    deck.push({ color: c, value: 'skip', id: c + '-skip-b' });
    deck.push({ color: c, value: 'reverse', id: c + '-reverse-a' });
    deck.push({ color: c, value: 'reverse', id: c + '-reverse-b' });
    deck.push({ color: c, value: '+2', id: c + '-+2-a' });
    deck.push({ color: c, value: '+2', id: c + '-+2-b' });
  }
  for (let i = 0; i < 4; i++) {
    deck.push({ color: 'wild', value: 'wild', id: 'wild-' + i });
    deck.push({ color: 'wild', value: '+4', id: '+4-' + i });
  }
  return deck;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

exports.createState = () => ({
  deck: [],
  discard: [],
  hands: [],
  currentColor: null,
  currentPlayer: 0,
  direction: 1,
  winner: null,
  drawStack: 0,
  unoCalled: [],     // per-player: has called UNO when at 1 card
  pendingChallenge: null,  // { by, target, handSnapshot, priorColor, chosenColor } | null
});

function initGame(state, playerCount) {
  const deck = createDeck();
  shuffle(deck);
  state.hands = [];
  for (let i = 0; i < playerCount; i++) {
    state.hands[i] = deck.splice(0, 7);
  }
  // First discard must not be wild
  let firstIdx = deck.findIndex(c => c.color !== 'wild');
  if (firstIdx === -1) firstIdx = 0;
  state.discard = [deck.splice(firstIdx, 1)[0]];
  state.deck = deck;
  state.currentColor = state.discard[0].color;
  state.currentPlayer = 0;
  state.direction = 1;
  state.winner = null;
  state.drawStack = 0;
  state.unoCalled = Array(playerCount).fill(true); // start true (no need at game start)
  state.pendingChallenge = null;
  state.lastChallenge = null;
}
exports.initGame = initGame;

function nextPlayer(state) {
  const n = state.hands.length;
  return ((state.currentPlayer + state.direction) % n + n) % n;
}

// Next player after an explicit `from` index (used to skip the +4 target).
function nextPlayerFrom(state, fromIndex) {
  const n = state.hands.length;
  return ((fromIndex + state.direction) % n + n) % n;
}

function canPlay(card, state) {
  const top = state.discard[0];
  if (card.color === 'wild') return true;
  if (card.value === top.value) return true;
  if (card.color === state.currentColor) return true;
  return false;
}

function drawCards(hand, count, state) {
  for (let i = 0; i < count; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length <= 1) break;
      const top = state.discard.shift();
      state.deck = state.discard;
      shuffle(state.deck);
      state.discard = [top];
    }
    if (state.deck.length > 0) hand.push(state.deck.pop());
  }
}

exports.handleMove = (data, state, playerIndex) => {
  if (state.winner !== null) return 'g_game_over';

  const hand = state.hands[playerIndex];
  const { cardId, chosenColor, uno, challengeResponse } = data || {};

  // ---- +4 Challenge response (must resolve before any other move) ----
  // When a +4 is pending, the turn belongs to the challenge target — not the
  // player recorded in state.currentPlayer (which still points at the +4
  // player). Handle this first so the target can act.
  if (challengeResponse !== undefined) {
    const ch = state.pendingChallenge;
    if (!ch) return 'uno_no_challenge_pending';
    if (playerIndex !== ch.target) return 'g_not_your_turn';
    if (challengeResponse !== 'accept' && challengeResponse !== 'challenge') return 'g_unknown_action';
    resolveChallenge(state, challengeResponse === 'challenge');
    return null;
  }

  if (state.pendingChallenge) return 'g_not_your_turn';
  if (playerIndex !== state.currentPlayer) return 'g_not_your_turn';

  // ---- UNO call ----
  if (uno) {
    state.unoCalled[playerIndex] = true;
    return null;
  }

  if (!cardId) {
    // Draw a card
    if (state.drawStack > 0) {
      // Must draw accumulated penalty
      const count = state.drawStack;
      state.drawStack = 0;
      drawCards(hand, count, state);
      state.currentPlayer = nextPlayer(state);
      return null;
    }
    // Official rule: may only draw when holding no playable card.
    const hasPlayable = hand.some(c => canPlay(c, state));
    if (hasPlayable) return 'uno_have_playable_card';
    drawCards(hand, 1, state);
    state.currentPlayer = nextPlayer(state);
    return null;
  }

  const cardIdx = hand.findIndex(c => c.id === cardId);
  if (cardIdx === -1) return 'uno_card_not_in_hand';
  const card = hand[cardIdx];

  if (state.drawStack > 0 && card.value !== '+2' && card.value !== '+4') return 'uno_must_draw_or_play';
  if (!canPlay(card, state) && state.drawStack === 0) return 'uno_cannot_play_card';
  if (card.color === 'wild' && chosenColor !== undefined && !COLORS.includes(chosenColor)) return 'uno_invalid_color';

  // UNO penalty: playing last card without calling UNO → instant loss
  if (hand.length === 1 && !state.unoCalled[playerIndex]) {
    hand.splice(cardIdx, 1);
    state.discard.unshift(card);
    state.winner = nextPlayer(state); // opponent wins
    state.phase = 'over';
    return null;
  }

  // Snapshot the hand BEFORE removing the card, so a later +4 challenge can
  // check whether the player actually held a matching-color card.
  var challengeSnapshot = (card.value === '+4') ? hand.map(function(c) { return { id: c.id, color: c.color, value: c.value }; }) : null;
  var priorColor = state.currentColor;

  hand.splice(cardIdx, 1);

  // If player now has 1 card, reset UNO call (must call before next play)
  if (hand.length === 1) {
    state.unoCalled[playerIndex] = false;
  }

  // If player played last card with UNO, no need to reset
  if (hand.length === 0) {
    state.unoCalled[playerIndex] = true;
  }
  state.discard.unshift(card);

  // Apply card effect
  switch (card.value) {
    case 'skip':
      state.currentPlayer = nextPlayer(state); // advance
      state.currentPlayer = nextPlayer(state); // skip one
      break;
    case 'reverse':
      if (state.hands.length === 2) {
        state.currentPlayer = playerIndex; // same as skip in 2p
      } else {
        state.direction *= -1;
      }
      break;
    case '+2':
      state.drawStack += 2;
      break;
    case '+4':
      // Penalty is not applied immediately — the target must first respond to
      // the challenge window (draw 4 or challenge). See challengeResponse above.
      break;
    case 'wild':
      break;
    default:
      break;
  }

  state.currentColor = card.color === 'wild' ? (chosenColor || 'red') : card.color;

  if (hand.length === 0) {
    state.winner = playerIndex;
    return null;
  }

  if (card.value === '+4') {
    // Hold the turn: the next player must accept the draw or challenge.
    state.pendingChallenge = {
      by: playerIndex,
      target: nextPlayer(state),
      handSnapshot: challengeSnapshot,
      priorColor: priorColor,
      chosenColor: chosenColor,
    };
    return null;
  }

  if (card.value !== 'skip' && card.value !== 'reverse') {
    state.currentPlayer = nextPlayer(state);
  }

  return null;
};

// Settle a pending +4. Any +2s stacked under it still land on whoever ends up drawing.
function resolveChallenge(state, challenged) {
  const ch = state.pendingChallenge;
  const stack = state.drawStack;
  let hadMatch = null;
  if (!challenged) {
    // Target draws 4 (plus the stack) and is skipped (normal +4 effect).
    drawCards(state.hands[ch.target], stack + 4, state);
    state.currentPlayer = nextPlayerFrom(state, ch.target);
  } else {
    // Reveal: did the +4 player hold any card matching the prior color?
    hadMatch = ch.handSnapshot.some(function(c) { return c.color === ch.priorColor; });
    if (hadMatch) {
      // Challenge succeeds -> the +4 player drew illegally, they draw 4; the target still owes the stack.
      drawCards(state.hands[ch.by], 4, state);
      drawCards(state.hands[ch.target], stack, state);
      state.currentPlayer = ch.target; // turn passes to the challenger
    } else {
      // Challenge fails -> challenger draws 6 (4 + 2 penalty) plus the stack.
      drawCards(state.hands[ch.target], stack + 6, state);
      state.currentPlayer = nextPlayerFrom(state, ch.target); // skip the challenger
    }
  }
  state.lastChallenge = { by: ch.by, challenged: challenged, hadMatch: hadMatch };
  state.pendingChallenge = null;
  state.drawStack = 0;
}

// While a +4 is pending, the challenge target is the one who must act.
exports.getCurrentActor = function (state) {
  return state.pendingChallenge ? state.pendingChallenge.target : state.currentPlayer;
};
exports.setCurrentActor = function (state, idx) {
  // A disconnected target accepts the +4 so the game keeps moving.
  if (state.pendingChallenge) resolveChallenge(state, false);
  else state.currentPlayer = idx;
};

// Hide other players' cards (and draw piles) from each client.
const { maskView } = require('./lib/hidden');
exports.playerView = function (state, playerIndex) {
  const view = maskView(state, playerIndex, { piles: ['deck'] });
  if (view !== state && state.pendingChallenge) {
    // The +4 player's hand is only used server-side to settle a challenge.
    view.pendingChallenge = Object.assign({}, state.pendingChallenge, { handSnapshot: undefined });
  }
  return view;
};

    return exports; })();
  engines.ludo=(function(){ var exports={};
    var require=function(name){ if(name==='./lib/i18n') return {pick:function(state,fa){return fa;}}; throw new Error('Unsupported Ludo dependency: '+name); };
// games/flightchess.js — 飞行棋 v5 (Game Logic fix only — fix auto pass, consolidate logic)
// No logic changes needed; the existing logic works correctly.
// The gameplay issue was if canMakeMove returns false, turn passes but dice=6
// should give another roll. Let's fix that edge case.

const { pick } = require('./lib/i18n');

const MAIN_PATH = 52;
const HOME_STRETCH = 6;
const HOME = MAIN_PATH + HOME_STRETCH;
const PLANES = 4;
const FLY_STEP = 8;   // own-color cell (in player steps) that has the dashed fly line
const FLY_ADV = 24;   // fly distance along the dashed line (lands on own color, near opposite side)

exports.name = 'flightchess';
exports.maxPlayers = 4;

exports.createState = () => {
  const players = [];
  for (let i = 0; i < 4; i++) {
    players.push({ planes: [-1, -1, -1, -1], finished: 0, noSixStreak: 0 });
  }
  return {
    currentPlayer: 0, winner: null, players, dice: 1,
    consecutiveSixes: 0, hasRolled: false, _playerCount: 4,
    lastMoveResult: '', // for frontend display
    palette: [0, 1, 2, 3], // slot → base-color index (cosmetic only); randomized in initGame
  };
};

exports.handleMove = (data, state, playerIndex) => {
  if (state.winner !== null) return 'g_game_over';
  if (state.currentPlayer !== playerIndex) return 'g_not_your_turn';

  const pData = state.players[playerIndex];
  const { action } = data || {};

  if (action === 'roll' || !action) {
    if (state.hasRolled) return 'fc_need_to_select_plane';
    let dice = Math.floor(Math.random() * 6) + 1;

    // Pity mechanism: if all planes are in base (or home) and player has rolled
    // non-6 for 5 consecutive turns, force a 6 so they can launch
    let pity = false;
    const allInBase = pData.planes.every(function(p) { return p === -1 || p === HOME; });
    if (allInBase && dice !== 6) {
      pData.noSixStreak = (pData.noSixStreak || 0) + 1;
      if (pData.noSixStreak >= 5) {
        dice = 6;
        pData.noSixStreak = 0;
        pity = true;
      }
    } else if (dice === 6 || !allInBase) {
      pData.noSixStreak = 0;
    }

    state.dice = dice; state.hasRolled = true;
    const name = windowNames(playerIndex, state);
    state.lastMoveResult = pick(state, `${name} 掷了 ${dice} 点`, `${name} rolled ${dice}`);
    if (pity) state.lastMoveResult += pick(state, '（🎲 保底机制触发）', ' (guaranteed 6 activated)');

    if (dice === 6) state.consecutiveSixes++;
    else state.consecutiveSixes = 0;

    if (state.consecutiveSixes >= 3) {
      state.consecutiveSixes = 0; state.hasRolled = false; advanceTurn(state);
      const name = windowNames(playerIndex, state);
      state.lastMoveResult = pick(state, `${name} 连续3次6，回合作废`, `${name} rolled 3 sixes in a row, turn forfeited`);
      return null;
    }

    // Auto-pass if no valid moves
    if (!hasValidMove(state, playerIndex)) {
      state.hasRolled = false;
      if (dice !== 6) advanceTurn(state);
      const name = windowNames(playerIndex, state);
      state.lastMoveResult = pick(state, `${name} 无合法走法，自动跳过`, `${name} has no valid moves, skipping`);
      return null;
    }
    return null;
  }

  if (action === 'move') {
    if (!state.hasRolled) return 'fc_roll_dice_first';
    const idx = data.planeIndex;
    if (!Number.isInteger(idx) || idx < 0 || idx >= PLANES) return 'fc_invalid_plane';

    const pos = pData.planes[idx];
    if (pos === HOME) return 'fc_plane_already_home';

    const dice = state.dice;

    if (pos === -1) {
      if (dice !== 6) return 'fc_must_roll_6_to_launch';
      pData.planes[idx] = 0; // start of path
      doLanding(state, playerIndex, idx);
      const name = windowNames(playerIndex, state);
      state.lastMoveResult = pick(state, `${name} 起飞了飞机${idx+1}号`, `${name} launched plane #${idx+1}`);
      endTurn(state, playerIndex); return null;
    }

    if (pos >= MAIN_PATH) {
      // Home stretch — exact count finishes; overshoot bounces back off the end,
      // so a plane is never permanently stuck waiting for the exact roll.
      let target = pos + dice;
      if (target > HOME) target = HOME - (target - HOME); // bounce back
      if (target === HOME) {
        pData.planes[idx] = HOME; pData.finished++;
        const name = windowNames(playerIndex, state);
        state.lastMoveResult = pick(state, `${name} 飞机${idx+1}号到家了！`, `${name}'s plane #${idx+1} reached home!`);
        if (pData.finished >= PLANES) { state.winner = playerIndex; return null; }
      } else {
        if (target < pos) {
          const name = windowNames(playerIndex, state);
          state.lastMoveResult = pick(state, `${name} 点数过头，反弹回退`, `${name} rolled too high, bouncing back`);
        }
        pData.planes[idx] = target;
      }
      endTurn(state, playerIndex); return null;
    }

    // Main path
    const newSteps = pos + dice;
    if (newSteps >= MAIN_PATH) {
      pData.planes[idx] = newSteps; // enters home stretch
      endTurn(state, playerIndex); return null;
    }
    pData.planes[idx] = newSteps;
    doLanding(state, playerIndex, idx);
    resolveSpecial(state, playerIndex, idx);

    endTurn(state, playerIndex); return null;
  }
  return 'g_invalid_action';
};

// Resolve special cells after a normal main-path landing:
//   - fly cell (own color): fly across the board (+FLY_ADV)
//   - own-color cell: jump forward 4 (once); if the jump lands on the fly cell, fly
function resolveSpecial(state, pi, idx) {
  const p = state.players[pi];
  const step = p.planes[idx];
  if (step <= 0 || step >= MAIN_PATH) return;

  // Fly cell: follow the dashed line across the board, then jump +4 (rule: 虚线到同色格后再跳一格)
  if (step === FLY_STEP) {
    flyAcross(state, pi, idx);
    const name = windowNames(pi, state);
    state.lastMoveResult = pick(state, `✈ ${name} 沿航线飞到对面！`, `✈ ${name} flew across the board!`);
    return;
  }
  // Own-color cell ⟺ step is a multiple of 4 (each player owns every 4th cell):
  // jump +4 to the next own-color cell and STOP — do not chain into the fly shortcut,
  // only a direct landing on FLY_STEP (handled above) flies.
  if (step % 4 === 0) {
    const jump = step + 4;
    if (jump < MAIN_PATH) {
      p.planes[idx] = jump; doLanding(state, pi, idx);
      const name = windowNames(pi, state);
      state.lastMoveResult = pick(state, `${name} 同色格跳 +4`, `${name} jumped +4 on same color`);
    }
  }
}

// Fly along the dashed line (+FLY_ADV) and STOP exactly at the arrow's end.
// No extra +4: the landing cell is own color, but chaining would overshoot the
// visible dashed arrow and confuse the player.
function flyAcross(state, pi, idx) {
  const p = state.players[pi];
  const dest = p.planes[idx] + FLY_ADV;
  if (dest >= MAIN_PATH) return;
  p.planes[idx] = dest; doLanding(state, pi, idx);
}

function hasValidMove(state, pi) {
  const p = state.players[pi], d = state.dice;
  for (let i = 0; i < PLANES; i++) {
    const po = p.planes[i];
    if (po === HOME) continue;
    if (po === -1) { if (d === 6) return true; continue; }
    if (po >= MAIN_PATH) { return true; } // home stretch: exact finishes, overshoot bounces
    if (po >= 0 && po < MAIN_PATH) return true;
  }
  return false;
}

function absPos(pi, steps) {
  return (pi * 13 + steps) % MAIN_PATH;
}

function doLanding(state, pi, idx) {
  const pos = state.players[pi].planes[idx];
  if (pos < 0 || pos >= MAIN_PATH) return;
  const landingAbs = absPos(pi, pos);
  for (let oi = 0; oi < state.players.length; oi++) {
    if (oi === pi) continue;
    for (let j = 0; j < PLANES; j++) {
      const op = state.players[oi].planes[j];
      if (op >= 0 && op < MAIN_PATH && absPos(oi, op) === landingAbs) {
        state.players[oi].planes[j] = -1;
        const attacker = windowNames(pi, state);
        const target = windowNames(oi, state);
        state.lastMoveResult = pick(state, `${attacker} 踩了${target}的飞机！`, `${attacker} caught ${target}'s plane!`);
      }
    }
  }
}

function endTurn(state, pi) {
  if (state.dice === 6 && state.consecutiveSixes < 3) {
    state.hasRolled = false;
  } else {
    state.hasRolled = false; state.consecutiveSixes = 0; advanceTurn(state);
  }
}

function advanceTurn(state) {
  const total = Math.min(state._playerCount || 4, 4);
  for (let i = 1; i <= total; i++) {
    const next = (state.currentPlayer + i) % total;
    if (state.players[next].finished < PLANES) { state.currentPlayer = next; return; }
  }
  state.currentPlayer = (state.currentPlayer + 1) % total;
}

function windowNames(pi, state) {
  return pick(state, `玩家${pi+1}`, `Player ${pi+1}`);
}

exports.initGame = (state, pc) => {
  state._playerCount = pc;
  state.players.length = pc;
  // Randomize the cosmetic color assignment each game (Fisher–Yates on [0,1,2,3]).
  const pal = [0, 1, 2, 3];
  for (let i = pal.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pal[i], pal[j]] = [pal[j], pal[i]];
  }
  state.palette = pal;
};

    return exports; })();
  engines.mafia=(function(){ var exports={};
// games/werewolf.js
// 狼人杀（预女猎白标准板）— the phone is the judge: night actions and votes happen
// on screen. Day talk is either out loud (talkMode 'face') or typed into the game
// (talkMode 'chat': turn-based speeches, then free discussion; wolves get a night
// channel). 6–12 players, 屠边 win condition.

exports.name = 'werewolf';
exports.maxPlayers = 12;
exports.minPlayers = 6;

const SETUPS = {
  6: { wolf: 2, seer: 1, witch: 1, villager: 2 },
  7: { wolf: 2, seer: 1, witch: 1, hunter: 1, villager: 2 },
  8: { wolf: 3, seer: 1, witch: 1, hunter: 1, villager: 2 },
  9: { wolf: 3, seer: 1, witch: 1, hunter: 1, villager: 3 },
  10: { wolf: 3, seer: 1, witch: 1, hunter: 1, villager: 4 },
  11: { wolf: 3, seer: 1, witch: 1, hunter: 1, idiot: 1, villager: 4 },
  12: { wolf: 4, seer: 1, witch: 1, hunter: 1, idiot: 1, villager: 4 },
};
const GODS = ['seer', 'witch', 'hunter', 'idiot'];
const SEC = { wolf: 40, witch: 25, dawn: 6, sign: 15, vote: 25, hunter: 20, badge: 15 };
const CHAT_MAX = 120;     // characters per message
const CHAT_GAP = 800;     // ms between two messages from one player
const CHAT_KEEP = 300;    // messages kept in state

exports.SETUPS = SETUPS;

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

exports.createState = () => ({
  phase: 'waiting',
  winner: null,
  n: 0,
  roles: [],
  alive: [],
  day: 0,
  deadline: 0,
  log: [],
});

exports.initGame = (state, n) => {
  const setup = SETUPS[Math.max(6, Math.min(12, n))];
  const roles = [];
  for (const role of Object.keys(setup)) for (let k = 0; k < setup[role]; k++) roles.push(role);
  const opts = state._options || {};
  Object.assign(state, {
    phase: 'night_wolf',
    winner: null,
    n,
    roles: shuffle(roles),
    alive: new Array(n).fill(true),
    revealed: new Array(n).fill(false), // idiot flipped / hunter shot → role public
    deathCause: new Array(n).fill(null),
    day: 0,
    night: 0,
    sheriff: -1,
    sheriffOn: opts.sheriff !== false,
    speechTime: [30, 60, 90, 120, 180].indexOf(opts.speechTime) >= 0 ? opts.speechTime : 60,
    talkMode: opts.talkMode === 'chat' ? 'chat' : 'face',
    discussTime: [0, 60, 120, 180].indexOf(opts.discussTime) >= 0 ? opts.discussTime : 60,
    chat: [],
    chatAt: {},
    potions: { save: true, poison: true },
    checks: [], // seer results
    log: [],
    queue: [],
  });
  startNight(state);
};

// ---------- helpers ----------
const alive = (s) => s.alive.map((a, i) => (a ? i : -1)).filter((i) => i >= 0);
const aliveWith = (s, role) => alive(s).filter((i) => s.roles[i] === role);
const setDeadline = (s, sec) => { s.deadline = Date.now() + sec * 1000; s.phaseSec = sec; };

function kill(s, i, cause) {
  if (!s.alive[i]) return;
  s.alive[i] = false;
  s.deathCause[i] = cause;
}

// 屠边: wolves win when every god or every villager is dead; good wins when no wolf is left.
function checkWin(s) {
  const a = alive(s);
  if (!a.some((i) => s.roles[i] === 'wolf')) return end(s, -3);
  if (!a.some((i) => s.roles[i] === 'villager') || !a.some((i) => GODS.indexOf(s.roles[i]) >= 0)) return end(s, -2);
  return false;
}
function end(s, winner) {
  s.winner = winner; // -2 wolves, -3 good
  s.phase = 'over';
  s.deadline = 0;
  return true;
}

// ---------- night ----------
function startNight(s) {
  s.night++;
  s.log.push({ night: s.night, t: 'night' });
  s.phase = 'night_wolf';
  s.wolfVotes = {};
  s.seerDone = aliveWith(s, 'seer').length === 0;
  s.knife = -1;
  s.witchDone = false;
  s.saved = false;
  s.poisoned = -1;
  setDeadline(s, SEC.wolf);
}

function wolfTarget(s) {
  const counts = {};
  for (const w of aliveWith(s, 'wolf')) {
    const t = s.wolfVotes[w];
    if (t === undefined) continue;
    counts[t] = (counts[t] || 0) + 1;
  }
  const keys = Object.keys(counts);
  if (!keys.length) return -1;
  const max = Math.max(...keys.map((k) => counts[k]));
  const top = keys.filter((k) => counts[k] === max);
  return parseInt(top[Math.floor(Math.random() * top.length)], 10);
}

function witchCanAct(s) {
  const w = aliveWith(s, 'witch')[0];
  return w !== undefined && (s.potions.save || s.potions.poison);
}

function endWolfPhase(s) {
  s.knife = wolfTarget(s);
  s.phase = 'night_witch';
  // The step runs even with no living witch, so its length gives nothing away.
  setDeadline(s, witchCanAct(s) ? SEC.witch : 5 + Math.floor(Math.random() * 4));
  if (!witchCanAct(s)) s.witchDone = true;
}

function endNight(s) {
  const deaths = [];
  if (s.knife >= 0 && !s.saved) deaths.push([s.knife, 'knife']);
  if (s.poisoned >= 0 && s.poisoned !== s.knife) deaths.push([s.poisoned, 'poison']);
  else if (s.poisoned >= 0) deaths[0] = [s.poisoned, 'poison'];
  s.pendingDeaths = deaths;
  s.day++;
  if (s.day === 1 && s.sheriffOn) {
    // Standard order: day 1 opens with the sheriff election, the night's result is announced after it.
    s.log.push({ day: s.day, t: 'dawn' });
    startSheriff(s);
  } else startDawn(s);
}

// ---------- dawn & death triggers ----------
function startDawn(s) {
  const deaths = s.pendingDeaths || [];
  s.pendingDeaths = [];
  for (const [i, cause] of deaths) kill(s, i, cause);
  s.lastNight = deaths.map((d) => d[0]).sort((a, b) => a - b);
  s.log.push({ day: s.day, t: 'deaths', list: s.lastNight });
  if (checkWin(s)) return;
  s.queue = [];
  for (const i of s.lastNight) queueDeath(s, i, s.day === 1);
  s.afterQueue = 'speech';
  s.phase = 'dawn';
  setDeadline(s, SEC.dawn);
}

function queueDeath(s, i, lastWords) {
  if (s.roles[i] === 'hunter' && s.deathCause[i] !== 'poison') s.queue.push({ kind: 'hunter', who: i });
  if (s.sheriff === i) s.queue.push({ kind: 'badge', who: i });
  if (lastWords) s.queue.push({ kind: 'last', who: i });
}

function runQueue(s) {
  const task = s.queue.shift();
  if (!task) return s.afterQueue === 'night' ? startNight(s) : startDaySpeech(s);
  s.actor = task.who;
  if (task.kind === 'last') return startSpeech(s, 'last', [task.who]);
  s.phase = task.kind; // 'hunter' | 'badge'
  setDeadline(s, task.kind === 'hunter' ? SEC.hunter : SEC.badge);
}

// ---------- speeches ----------
function startSpeech(s, kind, speakers) {
  s.phase = 'speech';
  s.speechKind = kind; // sheriff | day | pk | last
  s.speakers = speakers;
  s.speakerPos = 0;
  setDeadline(s, s.speechTime);
}

function startDaySpeech(s) {
  const a = alive(s);
  let first;
  if (s.sheriff >= 0 && s.alive[s.sheriff]) first = s.sheriff + 1; // sheriff speaks last
  else if (s.lastNight && s.lastNight.length) first = s.lastNight[0] + 1;
  else first = a[Math.floor(Math.random() * a.length)];
  const order = [];
  for (let k = 0; k < s.n; k++) {
    const i = (first + k) % s.n;
    if (s.alive[i]) order.push(i);
  }
  startSpeech(s, 'day', order);
}

function nextSpeaker(s) {
  s.speakerPos++;
  if (s.speakerPos < s.speakers.length) return setDeadline(s, s.speechTime);
  const kind = s.speechKind;
  if (kind === 'sheriff') return startVote(s, 'sheriff', s.candidates, false);
  if (kind === 'day') return s.discussTime > 0 ? startDiscuss(s) : startVote(s, 'exile', alive(s), false);
  if (kind === 'pk') return startVote(s, 'exile', s.speakers, true);
  return runQueue(s); // last words
}

// After the day speeches everyone may talk at once; it ends early when every living player is ready.
function startDiscuss(s) {
  s.phase = 'discuss';
  s.ready = {};
  setDeadline(s, s.discussTime);
}

// Who may type right now, and into which channel ('all' or 'wolf'); null = nobody can hear you.
function chatChannel(s, p) {
  if (s.talkMode !== 'chat' || s.winner !== null) return null;
  if (s.phase === 'speech') return s.speakers[s.speakerPos] === p ? 'all' : null;
  if (!s.alive[p]) return null;
  if (s.phase === 'discuss' || s.phase === 'vote') return 'all';
  if (s.phase === 'night_wolf' && s.roles[p] === 'wolf') return 'wolf';
  return null;
}
exports.chatChannel = chatChannel;

// ---------- sheriff election (day 1 only) ----------
function startSheriff(s) {
  s.phase = 'sheriff_sign';
  s.runs = {};
  setDeadline(s, SEC.sign);
}

function endSign(s) {
  s.candidates = alive(s).filter((i) => s.runs[i]);
  const voters = alive(s).filter((i) => !s.runs[i]);
  if (s.candidates.length === 1) {
    s.sheriff = s.candidates[0];
    s.log.push({ day: s.day, t: 'sheriff', who: s.sheriff });
  }
  if (s.candidates.length < 2 || !voters.length) {
    if (s.candidates.length !== 1) s.log.push({ day: s.day, t: 'no_sheriff' });
    return startDawn(s);
  }
  startSpeech(s, 'sheriff', s.candidates.slice());
}

// ---------- voting ----------
function startVote(s, kind, candidates, pk) {
  s.phase = 'vote';
  s.voteKind = kind; // sheriff | exile
  s.votePk = pk;
  s.voteCandidates = candidates.slice();
  s.voters = alive(s).filter((i) => {
    if (kind === 'sheriff') return s.candidates.indexOf(i) < 0;
    if (s.revealed[i] && s.roles[i] === 'idiot') return false; // a flipped idiot loses his vote
    return !pk || candidates.indexOf(i) < 0;
  });
  s.votes = {};
  setDeadline(s, SEC.vote);
}

function resolveVote(s) {
  const tally = {};
  for (const v of s.voters) {
    const t = s.votes[v];
    if (t === undefined || t < 0) continue;
    tally[t] = (tally[t] || 0) + (v === s.sheriff && s.voteKind === 'exile' ? 1.5 : 1);
  }
  const keys = Object.keys(tally).map(Number);
  const max = keys.length ? Math.max(...keys.map((k) => tally[k])) : 0;
  const top = keys.filter((k) => tally[k] === max).sort((a, b) => a - b);
  s.lastVote = { day: s.day, kind: s.voteKind, pk: s.votePk, votes: Object.assign({}, s.votes), tally, top };

  if (s.voteKind === 'sheriff') {
    if (top.length === 1) {
      s.sheriff = top[0];
      s.log.push({ day: s.day, t: 'sheriff', who: s.sheriff });
      return startDawn(s);
    }
    if (top.length > 1 && !s.votePk) return startVote(s, 'sheriff', top, true);
    s.log.push({ day: s.day, t: 'no_sheriff' });
    return startDawn(s);
  }

  if (top.length === 1) return exile(s, top[0]);
  if (top.length > 1 && !s.votePk) return startSpeech(s, 'pk', top);
  s.log.push({ day: s.day, t: 'no_exile' });
  startNight(s);
}

function exile(s, i) {
  if (s.roles[i] === 'idiot' && !s.revealed[i]) {
    s.revealed[i] = true;
    s.log.push({ day: s.day, t: 'idiot', who: i });
    return startNight(s);
  }
  kill(s, i, 'exile');
  s.log.push({ day: s.day, t: 'exile', who: i });
  if (checkWin(s)) return;
  s.queue = [];
  queueDeath(s, i, true);
  s.afterQueue = 'night';
  runQueue(s);
}

// ---------- moves ----------
exports.handleMove = (data, s, p) => {
  if (!data || s.winner !== null) return 'ww_not_now';
  const t = data.type;
  const isAlive = (i) => Number.isInteger(i) && i >= 0 && i < s.n && s.alive[i];

  if (t === 'chat') {
    const ch = chatChannel(s, p);
    if (!ch) return 'ww_chat_closed';
    // The sender saw a different channel (e.g. typed at night, phase flipped to day): never leak it.
    if (data.ch !== undefined && data.ch !== ch) return 'ww_chat_moved';
    const text = typeof data.text === 'string' ? data.text.replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX) : '';
    if (!text) return 'ww_chat_empty';
    const now = Date.now();
    if (now - (s.chatAt[p] || 0) < CHAT_GAP) return 'ww_chat_fast';
    s.chatAt[p] = now;
    // `at` = log length when sent, so the client can interleave chat with game events.
    s.chat.push({ p, ch, text, at: s.log.length, day: s.day });
    if (s.chat.length > CHAT_KEEP) s.chat.splice(0, s.chat.length - CHAT_KEEP);
    return null;
  }

  if (s.phase === 'night_wolf') {
    if (t === 'kill') {
      if (s.roles[p] !== 'wolf' || !s.alive[p]) return 'ww_not_now';
      if (data.target !== -1 && !isAlive(data.target)) return 'ww_bad_target';
      s.wolfVotes[p] = data.target;
    } else if (t === 'check') {
      if (s.roles[p] !== 'seer' || !s.alive[p] || s.seerDone) return 'ww_not_now';
      if (!isAlive(data.target) || data.target === p) return 'ww_bad_target';
      s.checks.push({ night: s.night, target: data.target, wolf: s.roles[data.target] === 'wolf' });
      s.seerDone = true;
    } else return 'ww_not_now';
    if (exports.getPendingActors(s).length === 0) endWolfPhase(s);
    return null;
  }

  if (s.phase === 'night_witch') {
    if (t !== 'witch' || s.roles[p] !== 'witch' || !s.alive[p] || s.witchDone) return 'ww_not_now';
    const save = !!data.save;
    const poison = Number.isInteger(data.poison) ? data.poison : -1;
    if (save && poison >= 0) return 'ww_one_potion';
    if (save && (!s.potions.save || s.knife < 0)) return 'ww_no_potion';
    if (save && s.knife === p) return 'ww_no_self_save';
    if (poison >= 0 && (!s.potions.poison || !isAlive(poison) || poison === p)) return 'ww_bad_target';
    if (save) { s.saved = true; s.potions.save = false; }
    if (poison >= 0) { s.poisoned = poison; s.potions.poison = false; }
    s.witchDone = true;
    endNight(s);
    return null;
  }

  if (s.phase === 'sheriff_sign') {
    if (t !== 'run' || !s.alive[p] || s.runs[p] !== undefined) return 'ww_not_now';
    s.runs[p] = !!data.run;
    if (exports.getPendingActors(s).length === 0) endSign(s);
    return null;
  }

  if (s.phase === 'speech') {
    if (t !== 'end_speech' || s.speakers[s.speakerPos] !== p) return 'ww_not_now';
    nextSpeaker(s);
    return null;
  }

  if (s.phase === 'discuss') {
    if (t !== 'ready' || !s.alive[p]) return 'ww_not_now';
    s.ready[p] = true;
    if (exports.getPendingActors(s).length === 0) startVote(s, 'exile', alive(s), false);
    return null;
  }

  if (s.phase === 'vote') {
    if (t !== 'vote' || s.voters.indexOf(p) < 0 || s.votes[p] !== undefined) return 'ww_not_now';
    if (data.target !== -1 && s.voteCandidates.indexOf(data.target) < 0) return 'ww_bad_target';
    s.votes[p] = data.target;
    if (exports.getPendingActors(s).length === 0) resolveVote(s);
    return null;
  }

  if (s.phase === 'hunter') {
    if (t !== 'shoot' || p !== s.actor) return 'ww_not_now';
    if (data.target !== -1 && (!isAlive(data.target) || data.target === p)) return 'ww_bad_target';
    s.revealed[p] = true;
    if (data.target >= 0) {
      kill(s, data.target, 'shot');
      s.log.push({ day: s.day, t: 'shot', by: p, who: data.target });
      if (checkWin(s)) return null;
      if (s.sheriff === data.target) s.queue.unshift({ kind: 'badge', who: data.target });
    }
    runQueue(s);
    return null;
  }

  if (s.phase === 'badge') {
    if (t !== 'badge' || p !== s.actor) return 'ww_not_now';
    if (data.target !== -1 && !isAlive(data.target)) return 'ww_bad_target';
    s.sheriff = data.target;
    s.log.push({ day: s.day, t: 'badge', by: p, who: data.target });
    runQueue(s);
    return null;
  }

  return 'ww_not_now';
};

// ---------- phase hooks (server.js schedulePhaseGame) ----------
exports.getPhaseDeadline = (s) => (s.winner === null && s.phase !== 'waiting' ? s.deadline : 0);

exports.getPendingActors = (s) => {
  if (s.winner !== null) return [];
  switch (s.phase) {
    case 'night_wolf': {
      const list = aliveWith(s, 'wolf').filter((w) => s.wolfVotes[w] === undefined);
      if (!s.seerDone) list.push(aliveWith(s, 'seer')[0]);
      return list;
    }
    case 'night_witch': return s.witchDone ? [] : aliveWith(s, 'witch');
    case 'sheriff_sign': return alive(s).filter((i) => s.runs[i] === undefined);
    case 'speech': return [s.speakers[s.speakerPos]];
    case 'discuss': return alive(s).filter((i) => !s.ready[i]);
    case 'vote': return s.voters.filter((v) => s.votes[v] === undefined);
    case 'hunter': case 'badge': return [s.actor];
    default: return [];
  }
};

exports.onTimeout = (s) => {
  switch (s.phase) {
    case 'night_wolf': return endWolfPhase(s);
    case 'night_witch': s.witchDone = true; return endNight(s);
    case 'sheriff_sign': return endSign(s);
    case 'speech': return nextSpeaker(s);
    case 'discuss': return startVote(s, 'exile', alive(s), false);
    case 'vote': return resolveVote(s);
    case 'hunter': s.revealed[s.actor] = true; return runQueue(s);
    case 'badge':
      s.log.push({ day: s.day, t: 'badge', by: s.actor, who: -1 });
      s.sheriff = -1;
      return runQueue(s);
    case 'dawn': return runQueue(s);
  }
};

// Everyone may act at once, so there is no single turn owner.
exports.getCurrentActor = () => -1;
exports.setCurrentActor = () => {};

// ---------- hidden information ----------
exports.playerView = (s, idx) => {
  const v = JSON.parse(JSON.stringify(s));
  delete v.chatAt;
  if (!Array.isArray(s.roles) || !s.roles.length) return v;
  const over = s.winner !== null;
  const mine = s.roles[idx];
  v.myRole = mine || null;
  if (!over) {
    v.roles = s.roles.map((r, i) => (i === idx || s.revealed[i] || (mine === 'wolf' && r === 'wolf') ? r : null));
    v.deathCause = s.deathCause.map((c) => (c === 'shot' || c === 'exile' ? c : c ? 'dead' : null));
    if (mine !== 'wolf') v.wolfVotes = {};
    if (mine !== 'wolf') v.chat = (s.chat || []).filter((m) => m.ch !== 'wolf');
    if (mine !== 'seer') v.checks = [];
    if (mine !== 'witch') v.potions = null;
    v.knife = mine === 'witch' && s.phase === 'night_witch' && s.potions.save ? s.knife : -1;
    v.saved = false;
    v.poisoned = -1;
    v.pendingDeaths = [];
    v.queue = []; // upcoming hunter/badge steps would reveal the hunter and how they died
    v.seerDone = mine === 'seer' ? s.seerDone : false;
    v.witchDone = mine === 'witch' ? s.witchDone : false;
    // Who has answered is shown, not what they answered (until results are public).
    if (s.phase === 'sheriff_sign') v.runs = Object.keys(s.runs).reduce((o, k) => { o[k] = +k === idx ? s.runs[k] : null; return o; }, {});
    if (s.phase === 'vote') v.votes = Object.keys(s.votes).reduce((o, k) => { o[k] = +k === idx ? s.votes[k] : null; return o; }, {});
  }
  return v;
};

    return exports; })();
  engines.truthdare=(function(){ var exports={};
    var require=function(name){ if(name==='./lib/i18n') return {pick:function(state,fa){return fa;}}; throw new Error('Unsupported Truth/Dare dependency: '+name); };
// games/truthdare.js
// 真心话大冒险 — party helper for drawing shared truth/dare cards.

const { pick } = require('./lib/i18n');

exports.name = 'truthdare';
exports.maxPlayers = 10;
exports.minPlayers = 2;

const BUILTIN_DECKS = {
  icebreaker: {
    name: '轻松破冰',
    nameEn: 'Icebreaker',
    truth: [
      {text: '最近让你笑出声的一件小事是什么？', textEn: 'What small thing made you laugh out loud recently?'},
      {text: '如果今天可以重来一次，你最想重来哪个瞬间？', textEn: 'If you could redo today, which moment would you choose?'},
      {text: '你小时候最相信的一件离谱事情是什么？', textEn: 'What absurd thing did you believe as a child?'},
      {text: '最近一次被别人温柔到是什么时候？', textEn: 'When was the last time someone\u0027s kindness touched you?'},
      {text: '你最喜欢别人怎么夸你？', textEn: 'How do you most like being complimented?'},
      {text: '如果给自己取一个游戏昵称，你会叫什么？', textEn: 'If you picked a gaming username, what would it be?'},
    ],
    dare: [
      {text: '用三种表情连续自拍，给大家看最后一张。', textEn: 'Take 3 consecutive selfies with different expressions, show the last one.'},
      {text: '用播音腔介绍现场的一位玩家。', textEn: 'Introduce a player in a broadcaster voice.'},
      {text: '选一个人，认真夸 TA 15 秒。', textEn: 'Pick someone and sincerely compliment them for 15 seconds.'},
      {text: '模仿一种动物 10 秒。', textEn: 'Imitate an animal for 10 seconds.'},
      {text: '用一句话给今晚的聚会起标题。', textEn: 'Give tonight\u0027s party a one-line title.'},
      {text: '做一个你觉得最像\u201c胜利者\u201d的姿势。', textEn: 'Strike a pose you think looks most like \u201cvictor\u201d.'},
    ],
  },
  party: {
    name: '朋友聚会',
    nameEn: 'Party',
    truth: [
      {text: '在场谁最容易把气氛带起来？为什么？', textEn: 'Who here is best at livening up the atmosphere? Why?'},
      {text: '你最近一次社死经历是什么？', textEn: 'What was your most recent embarrassing moment?'},
      {text: '如果必须和在场一位玩家组队闯关，你选谁？', textEn: 'If you had to team up with one player here, who would it be?'},
      {text: '你手机里最近一张照片是什么内容？', textEn: 'What\u0027s the latest photo in your phone?'},
      {text: '你最受不了朋友哪种迟到理由？', textEn: 'What late excuse from a friend annoys you most?'},
      {text: '你觉得自己最像哪种桌游角色？', textEn: 'Which board game character do you resemble most?'},
    ],
    dare: [
      {text: '让大家给你指定一个 pose，保持 10 秒。', textEn: 'Let everyone pick a pose for you, hold it for 10 seconds.'},
      {text: '随机给通讯录里一位朋友发一个表情包。', textEn: 'Send a random sticker to someone in your contacts.'},
      {text: '用方言或奇怪口音说一句\u201c我输了但我很优雅\u201d。', textEn: 'Say \u201cI lost but I\u2019m graceful\u201d in a dialect or funny accent.'},
      {text: '和左手边的人击掌，并喊一句队名。', textEn: 'High-five the person to your left and shout a team name.'},
      {text: '闭眼指出今晚最有冠军相的人。', textEn: 'Point with closed eyes to who looks most like tonight\u0027s champion.'},
      {text: '用不超过 5 个字评价每位玩家。', textEn: 'Describe each player in under 5 words.'},
    ],
  },
  deep: {
    name: '深度真心话',
    nameEn: 'Deep Talk',
    truth: [
      {text: '你最近在为什么事情偷偷努力？', textEn: 'What have you been quietly working on recently?'},
      {text: '你最希望朋友理解你的哪一点？', textEn: 'What do you wish your friends understood about you?'},
      {text: '哪一刻你觉得自己真的长大了？', textEn: 'When did you feel you truly grew up?'},
      {text: '你最想保留现在生活里的哪件事？', textEn: 'What part of your current life do you want to keep most?'},
      {text: '有没有一句话对你影响很久？', textEn: 'Is there a quote that has influenced you for a long time?'},
      {text: '你最近最想感谢谁？', textEn: 'Who do you most want to thank recently?'},
    ],
    dare: [
      {text: '给一位玩家说一句真诚的感谢。', textEn: 'Give a sincere thank you to another player.'},
      {text: '分享一个你最近收藏的好东西。', textEn: 'Share something good you recently bookmarked/discovered.'},
      {text: '对自己说一句鼓励的话，声音要让大家听见。', textEn: 'Say an encouraging phrase to yourself loud enough for everyone.'},
      {text: '选一个人，请 TA 给你一个小建议。', textEn: 'Pick someone and ask them for a piece of advice.'},
      {text: '讲一个你坚持了很久的小习惯。', textEn: 'Share a small habit you\u0027ve kept for a long time.'},
      {text: '说出现场每个人一个你欣赏的点。', textEn: 'Name one quality you appreciate about each person here.'},
    ],
  },
  challenge: {
    name: '大冒险挑战',
    nameEn: 'Challenge',
    truth: [
      {text: '你最怕被朋友发现的小习惯是什么？', textEn: 'What small habit are you afraid your friends might discover?'},
      {text: '如果必须公开一个黑历史，你会选哪一个？', textEn: 'If you had to reveal an embarrassing past, which one would you pick?'},
      {text: '你觉得自己最不适合参加哪类综艺？', textEn: 'What type of show would you be worst at?'},
      {text: '你曾经为了面子硬撑过什么？', textEn: 'What did you pretend was fine just to save face?'},
      {text: '你最近一次嘴硬是什么时候？', textEn: 'When was the last time you refused to admit you were wrong?'},
      {text: '你最容易被哪句话破防？', textEn: 'What kind of remark gets to you the most emotionally?'},
    ],
    dare: [
      {text: '原地转三圈后说一句超自信的话。', textEn: 'Spin around 3 times then say something super confident.'},
      {text: '用夸张表情读出最近一条非隐私消息。', textEn: 'Read your most recent non-private message with exaggerated expression.'},
      {text: '让大家投票指定你模仿一个角色。', textEn: 'Have everyone vote on a character for you to imitate.'},
      {text: '用身体摆出一个汉字，让大家猜。', textEn: 'Use your body to form a Chinese character, let everyone guess.'},
      {text: '唱一句你脑子里现在出现的歌。', textEn: 'Sing a line of whatever song is in your head right now.'},
      {text: '给自己设计一个 5 秒钟出场动画。', textEn: 'Design a 5-second entrance animation for yourself.'},
    ],
  },
};

exports.createState = () => ({
  players: 0,
  currentPlayer: 0,
  winner: null,
  decks: {},
  enabledDecks: [],
  currentCard: null,
  history: [],
  drawCount: 0,
});

exports.getDefaultDecks = function () {
  return cloneDecks(BUILTIN_DECKS);
};

exports.initGame = function (state, playerCount) {
  const options = state._options || {};
  state.players = playerCount;
  state.currentPlayer = 0;
  state.winner = null;
  state.decks = buildDecks(options);
  state.enabledDecks = normalizeEnabledDecks(options.enabledDecks, state.decks);
  state.currentCard = null;
  state.history = [];
  state.drawCount = 0;
};

exports.handleMove = function (data, state, playerIndex) {
  if (!state || state.winner !== null) return 'g_game_over';
  const action = data && data.action;
  if (action !== 'draw') return 'g_unknown_action';

  let kind = data.kind || 'random';
  if (kind !== 'truth' && kind !== 'dare' && kind !== 'random') {
    return 'td_choose_kind';
  }

  if (kind === 'random') {
    const truthCards = collectCards(state, 'truth');
    const dareCards = collectCards(state, 'dare');
    if (truthCards.length === 0 && dareCards.length > 0) kind = 'dare';
    else if (dareCards.length === 0 && truthCards.length > 0) kind = 'truth';
    else kind = Math.random() < 0.5 ? 'truth' : 'dare';
  }

  let cards = collectCards(state, kind);
  if (cards.length === 0) {
    // Fall back to the built-in decks for this draw only; the room's own decks stay as chosen.
    const builtIn = buildDecks({});
    cards = collectCards({ decks: builtIn, enabledDecks: Object.keys(builtIn) }, kind);
  }
  if (cards.length === 0) return 'td_empty_deck';

  const picked = cards[Math.floor(Math.random() * cards.length)];
  const card = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    kind,
    text: picked.text,
    textEn: picked.textEn || picked.text,
    deck: picked.deck,
    deckName: picked.deckName,
    deckNameEn: picked.deckNameEn || picked.deckName,
    player: playerIndex,
    at: Date.now(),
  };

  state.currentCard = card;
  state.drawCount = (state.drawCount || 0) + 1;
  state.history.unshift(card);
  if (state.history.length > 12) state.history.length = 12;
  return null;
};

function buildDecks(options) {
  const decks = cloneDecks(BUILTIN_DECKS);
  const customTruth = splitCustomCards(options.customTruths);
  const customDare = splitCustomCards(options.customDares);
  decks.custom = {
    name: '自定义',
    nameEn: 'Custom',
    truth: customTruth,
    dare: customDare,
  };
  return decks;
}

function normalizeEnabledDecks(enabled, decks) {
  const allKeys = Object.keys(decks);
  if (!Array.isArray(enabled) || enabled.length === 0) {
    return allKeys.filter(key => key !== 'custom' || hasCards(decks.custom));
  }
  const valid = enabled.filter(key => decks[key] && (key !== 'custom' || hasCards(decks.custom)));
  return valid.length > 0 ? valid : allKeys.filter(key => key !== 'custom' || hasCards(decks.custom));
}

function collectCards(state, kind) {
  const decks = state.decks && Object.keys(state.decks).length ? state.decks : buildDecks({});
  const enabled = normalizeEnabledDecks(state.enabledDecks, decks);
  const cards = [];
  enabled.forEach(deckKey => {
    const deck = decks[deckKey];
    if (!deck || !Array.isArray(deck[kind])) return;
    deck[kind].forEach(card => {
      if (typeof card === 'string') {
        cards.push({ text: card, textEn: card, deck: deckKey, deckName: deck.name || deckKey, deckNameEn: deck.nameEn || deckKey });
      } else {
        cards.push({ text: card.text, textEn: card.textEn || card.text, deck: deckKey, deckName: deck.name || deckKey, deckNameEn: deck.nameEn || deckKey });
      }
    });
  });
  return cards;
}

function splitCustomCards(text) {
  if (typeof text !== 'string') return [];
  return text
    .split(/\r?\n|[;；]/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 80);
}

function hasCards(deck) {
  return !!deck && ((deck.truth && deck.truth.length > 0) || (deck.dare && deck.dare.length > 0));
}

function cloneDecks(decks) {
  const out = {};
  Object.keys(decks).forEach(key => {
    out[key] = {
      name: decks[key].name,
      nameEn: decks[key].nameEn || decks[key].name,
      truth: decks[key].truth.slice(),
      dare: decks[key].dare.slice(),
    };
  });
  return out;
}

    return exports; })();
  root.ApoloGameEngines=engines;
})(window);